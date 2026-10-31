# 30 — Architecture

> System design for v0.1. Every significant choice here has an [ADR](adr/README.md) behind it.
>
> **Guiding constraint:** one developer, part-time. The architecture optimizes for _how little there is to operate_, not for theoretical scalability. Managed services over self-hosted, boring over clever, deleteable over extensible.

---

## System overview

```
┌───────────────────────────────────────────────────────────┐
│                    CLIENT (Expo / React Native)           │
│                    iOS · Android · web · (desktop later)  │
│                                                           │
│  ┌────────────┐   ┌─────────────┐   ┌──────────────────┐  │
│  │ UI layer   │   │ State       │   │ Local cache      │  │
│  │ Expo Router│◄─►│ Zustand +   │◄─►│ SQLite           │  │
│  │ + UI kit   │   │ TanStack Q  │   │ (expo-sqlite)    │  │
│  └────────────┘   └──────┬──────┘   └──────────────────┘  │
│                          │            reads work offline  │
│                   ┌──────▼──────┐                         │
│                   │ data layer  │  the only code that     │
│                   │ (repos)     │  knows about the network│
│                   └──────┬──────┘                         │
└──────────────────────────┼────────────────────────────────┘
                           │ HTTPS / WSS
┌──────────────────────────▼────────────────────────────────┐
│                  SUPABASE (managed)                       │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Auth     │  │ Postgres │  │ Realtime │  │ Storage   │  │
│  │ magic    │  │ + RLS ◄──┼──┤ broadcast│  │ private   │  │
│  │ link     │  │          │  │ channels │  │ buckets   │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
│                     ▲                                     │
│              RLS is the security boundary —               │
│              not the client, ever                         │
└───────────────────────────────────────────────────────────┘
```

**No custom backend server in v0.1.** The client talks to Supabase directly, and Postgres row-level security is the authorization boundary. This removes an entire tier from the system — and the operational burden that comes with it. Edge Functions get added later only when something genuinely can't be expressed as a query plus a policy (server-side receipt validation in Phase 2 is the first likely case).

---

## Client architecture

### Layers

```
app/           Expo Router routes — thin. Layout and composition only
  └─ src/features/*/screens/     screen components
       └─ src/features/*/hooks/  feature logic
            └─ src/features/*/api/   data access (repositories)
                 └─ src/lib/supabase, src/lib/db   transport & cache
```

**The one hard rule:** _screens never import the Supabase client._ All data access goes through a feature's repository. This is what makes offline, caching and (if ever needed) a backend swap tractable instead of a rewrite.

### Vertical slices, not layer folders

Code is organized by **feature**, not by type — `features/setlist/` holds its screens, hooks, api and types together. A feature can be understood, or deleted, in one place. With ~76 features on the roadmap ([10-feature-inventory](../product/10-feature-inventory.md)), a `components/`+`hooks/`+`services/` layout would become unnavigable by v0.3.

```
src/features/
├── auth/          sign-in, session, route guards
├── band/          create, join, members, band home
├── repertoire/    songs, charts
├── events/        rehearsals and gigs, availability
├── setlist/       building, viewing, performance mode, live sync
└── me/            profile, personal notes  (grows into practice in v0.2)
```

### State: three kinds, three tools

| Kind                                                         | Tool           | Example                                                |
| ------------------------------------------------------------ | -------------- | ------------------------------------------------------ |
| **Server state** — owned by the backend, cached here         | TanStack Query | The repertoire, events, setlists                       |
| **UI state** — ephemeral, local                              | Zustand        | Current tab, is the sheet open, sync attached/detached |
| **Persistent local state** — survives restart, works offline | SQLite         | The full offline cache of band data                    |

Conflating these is the usual source of state chaos. Keeping them separate is the cheapest architectural decision in the project.

---

## Data flow

### Read (offline-first)

```
Screen → hook → repository ──► SQLite cache ──► render immediately
                     │                              ▲
                     └──► Supabase (if online) ─────┘ revalidate
```

The UI **never waits for the network to show data it already has** ([Rule 4](../design/20-design-principles.md)). Cache first, network second, re-render on arrival.

### Write (v0.1: online-required for shared data)

```
Screen → hook → repository → Supabase → SQLite updated → UI
                     └─► optimistic UI update immediately
```

v0.1 requires connectivity for _shared_ writes; personal writes (notes) are queued locally. Full offline write is v0.2 ([ADR-0003](adr/0003-offline-first-sync-strategy.md)).

### Realtime (live setlist sync)

```
Leader taps "next" ──► broadcast on channel `event:{id}` ──► all subscribers
                                                                  │
                       each device updates its own view ◄──────────┘
                       (if attached; ignores if detached)
```

Ephemeral. If it fails, every device keeps working alone and re-attaches later. **A dropped live session can never corrupt durable data** — see invariant 7 in [13-domain-model](../product/13-domain-model.md).

---

## Backend architecture

### Authorization: RLS is the boundary

Every table has row-level security. The rule is uniform and derives from one predicate: _you can see a band's rows if and only if you have an active membership in that band._ Personal rows (`song_personal`) add `user_id = auth.uid()`.

This is enforced **in the database**, so a bug in the client cannot leak another band's data ([N7](../product/11-mvp-scope.md)). Schema and policies in [32-data-model](32-data-model.md).

### Storage: private buckets only

Charts and audio live in a private bucket, path-namespaced by band (`band/{band_id}/…`), reachable only through short-lived signed URLs issued to members. **No public URLs, ever.** This is a legal requirement, not a preference ([ADR-0007](adr/0007-copyright-user-generated-charts-only.md)).

### Auth: email + password for now, email OTP next

Email and password ([ADR-0008](adr/0008-email-password-auth-now-otp-later.md)). Passwordless was the plan and remains the target, but both passwordless methods need a transactional email provider before anyone can sign in even once, and authentication blocks every other story in v0.1.

Sign-up is **disabled**: accounts are created deliberately in the dashboard while Jamly is invite-only. Sessions live in the OS keystore (`expo-secure-store`), chunked past its 2048-byte Android limit; password strength is enforced server-side, never as a client rule; a wrong password and an unknown account are answered identically. A reset flow is owed (`F606`).

Email OTP — a six-digit code, no deep link — arrives with the email provider and signs in the same `auth.users` row. Social login is v0.2.

---

## Offline strategy (v0.1 scope, stated honestly)

| Capability                  | v0.1                | v0.2                                |
| --------------------------- | ------------------- | ----------------------------------- |
| Read all band data offline  | ✅                  | ✅                                  |
| Charts available offline    | ✅ pre-downloaded   | ✅                                  |
| Write personal data offline | ✅ queued           | ✅                                  |
| Write shared data offline   | ❌ needs connection | ✅ queued                           |
| Conflict resolution         | n/a                 | last-write-wins + visible indicator |

**Deliberately not building CRDTs.** Two members simultaneously reordering the same setlist on flaky connections is a rare event with an expensive solution. Last-write-wins with a visible marker is the honest trade ([ADR-0003](adr/0003-offline-first-sync-strategy.md), [R7](../business/06-risks-and-open-questions.md)).

---

## Environments

| Env            | Purpose               | Notes                                                  |
| -------------- | --------------------- | ------------------------------------------------------ |
| **local**      | Development           | Supabase local via CLI, or a personal cloud project    |
| **staging**    | Pre-release testing   | Separate Supabase project; where migrations are proven |
| **production** | Real bands, real gigs | Backups on. Migrations only after staging              |

Migrations are versioned SQL in `supabase/migrations/` and applied in order. **Never a manual change in the dashboard** — untracked schema drift is how a solo project loses the ability to reason about its own database.

---

## Security & privacy

- All traffic over TLS. Nothing else is accepted.
- Secrets live in env vars; **only the anon key ships in the client** — which is safe precisely because RLS does the real work.
- Files are private, band-scoped, signed-URL access only.
- Personal notes are readable by exactly one user, enforced in the database.
- Minimal analytics, no third-party ad SDKs, no data brokerage ([05-business-model](../business/05-business-model.md)).
- Data export available free to everyone from v0.2 ([R9](../business/06-risks-and-open-questions.md)).

## Observability

Deliberately minimal for v0.1: crash reporting, plus the handful of product metrics that answer the validation questions ([14-validation-plan](../product/14-validation-plan.md)). **Storage bytes per user and per band are recorded from the first upload** — you cannot price what you never measured ([05-business-model](../business/05-business-model.md)).

## Testing

| Level       | Scope                                                                             |
| ----------- | --------------------------------------------------------------------------------- |
| Unit        | Jest. Pure logic: setlist duration maths, date handling, transposition later      |
| Component   | Critical screens with React Native Testing Library                                |
| Integration | Repositories against a local Supabase, **including RLS policy tests**             |
| E2E         | One Maestro smoke flow: sign in → band → song → setlist                           |
| Manual      | Performance mode, live sync, offline. Physically, on real devices, in a dark room |

RLS policy tests are the highest-value tests in the project: a broken policy is a data breach, and it is exactly the kind of bug that no UI test catches.

---

## What we are deliberately not doing in v0.1

| Not doing                          | Why                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------- |
| Custom API server                  | Nothing needs it yet; it would double the surface to operate              |
| GraphQL                            | REST + typed client is enough for ~10 entities                            |
| Microservices                      | It's one app                                                              |
| CRDTs / full offline collaboration | Over-engineering for the actual conflict rate                             |
| Monorepo                           | One app, one package                                                      |
| Payment integration                | Phase 1 is free ([ADR-0005](adr/0005-monetization-free-now-pro-later.md)) |
| Self-hosting                       | Operating a database is not the point of this project                     |

Each of these is a real option, and each would be a reasonable choice for a larger team. For one part-time developer, every one of them buys capability at the cost of the thing that actually kills this project: momentum ([R1](../business/06-risks-and-open-questions.md), [R4](../business/06-risks-and-open-questions.md)).

---

**Related:** [31 — Stack](31-stack.md) · [32 — Data Model](32-data-model.md) · [33 — Conventions](33-conventions.md) · [ADRs](adr/README.md)
