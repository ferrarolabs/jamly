# 33 — Conventions

> Conventions exist so that returning to this codebase after a two-month gap costs an hour, not a week ([R4](../business/06-risks-and-open-questions.md)). They are boring on purpose.

---

## Repository layout

```
jamly/
├── app/                      Expo Router routes — thin, layout & composition only
│   ├── _layout.tsx
│   ├── (auth)/               unauthenticated: welcome, sign-in
│   ├── (tabs)/               band · repertoire · dates · setlists · me
│   ├── join/[code].tsx       the invite deep link ⭐
│   └── performance/[id].tsx  full-screen takeover, no tab bar
│
├── src/
│   ├── components/           shared UI kit (Button, Card, Screen, EmptyState…)
│   ├── features/             VERTICAL SLICES — the main organizing principle
│   │   ├── auth/
│   │   ├── band/
│   │   ├── repertoire/
│   │   ├── events/
│   │   ├── setlist/
│   │   └── me/
│   │       ├── api/          data access (repositories) — the ONLY place Supabase is touched
│   │       ├── hooks/        feature logic
│   │       ├── components/   feature-local UI
│   │       └── types.ts
│   ├── lib/                  supabase client, local db, sync, entitlements, utils
│   ├── theme/                design tokens: colors, spacing, typography
│   └── types/                shared domain types (mirror 13-domain-model)
│
├── supabase/migrations/      versioned SQL — the schema's source of truth
├── docs/                     this documentation
├── assets/
└── .github/workflows/
```

### The two structural rules

1. **Screens never import the Supabase client.** All data access goes through `features/*/api/`. This keeps offline, caching and testability tractable ([30-architecture](30-architecture.md)).
2. **Features are vertical slices.** Everything for setlists lives under `features/setlist/`. Shared code moves to `src/components` or `src/lib` only when a _second_ feature actually needs it — not in anticipation.

---

## Naming

| Thing           | Convention                             | Example                   |
| --------------- | -------------------------------------- | ------------------------- |
| Component files | `PascalCase.tsx`                       | `SetlistItemRow.tsx`      |
| Hooks           | `useThing.ts`                          | `useNextEvent.ts`         |
| Repositories    | `thing.repo.ts`                        | `setlist.repo.ts`         |
| Types           | `PascalCase`                           | `SetlistItem`             |
| Fields (TS)     | `camelCase`                            | `durationSeconds`         |
| Fields (DB)     | `snake_case`                           | `duration_seconds`        |
| Route files     | `kebab-case` / Expo Router conventions | `join/[code].tsx`         |
| Booleans        | `is` / `has` / `can` prefix            | `isAttachedToLiveSession` |

**Domain names come from [13-domain-model](../product/13-domain-model.md) and nowhere else.** A `Setlist` is never a `Playlist`, in code or in UI. This is the technical enforcement of [Design Rule 5](../design/20-design-principles.md).

**snake_case ↔ camelCase mapping happens once, in the repository layer.** Nothing above `features/*/api/` ever sees a snake_case field.

---

## TypeScript

- `strict: true`. No exceptions.
- **No `any`.** Use `unknown` and narrow. A single `// eslint-disable` with a written reason is acceptable; a habit of them is not.
- Types generated from the database (`supabase gen types`) live in `src/types/database.ts` and are **regenerated after every migration**. Domain types are hand-written on top — the generated shape is not the domain.
- Prefer `type` over `interface` unless declaration merging is needed.
- Discriminated unions over optional-field soup: `SetlistItem` is `{kind: 'song', songId} | {kind: 'break', label}`.

## React / React Native

- Function components, hooks only.
- One component per file; co-locate a component's styles with it.
- **All colours, spacing and type sizes come from `src/theme` tokens.** No literal hex values, no magic numbers in styles — the stage-dark theme is a product feature ([Rule 3](../design/20-design-principles.md)) and can't be maintained if it's scattered.
- Lists always use `FlashList` with a stable `keyExtractor`.
- Effects are a last resort. Derive during render; fetch with TanStack Query.

## Data access

- One repository per feature, exposing plain functions: `getSongs(bandId)`, `createSong(input)`.
- Repositories return **domain types**, never raw database rows.
- Every query goes through TanStack Query with a stable, documented key.
- Errors are typed and handled at the hook boundary — screens receive a state, never a raw exception.

---

## Git

**Branches:** `main` is always releasable. Work on `feat/…`, `fix/…`, `docs/…`, `chore/…`.

**Commits — Conventional Commits:**

```
feat(setlist): drag to reorder items
fix(sync): reattach after connection loss
docs(adr): add 0004 realtime transport
chore(deps): bump expo to sdk 56
```

Rationale: it's greppable, it makes a changelog free, and — the real reason for a solo project — `git log` becomes a readable record of what happened when you come back after a gap.

**Pull requests:** used even solo. A PR is a place to reread your own work, and CI runs there. Squash-merge; the PR title becomes the commit.

**Never committed:** `.env`, service-role keys, `node_modules`, build output, `.expo`, personal test data. `.env.example` documents required variables with no values.

---

## Definition of done

A piece of work is done when:

- [ ] It works on **iOS and Android** — not one and "probably the other"
- [ ] Types pass, lint passes, formatting passes, existing tests pass
- [ ] New logic has a test where a test is meaningful
- [ ] It works **offline** if it's a read path
- [ ] It respects the theme tokens and is legible in the dark
- [ ] Any decision made along the way is written down ([41-decision-log](../process/41-decision-log.md)) or is an [ADR](adr/README.md)
- [ ] The docs it contradicts have been updated

---

## Documentation rules

- **Docs live with the code**, in the same commit as the change they describe.
- Significant technical decisions → an [ADR](adr/README.md). Smaller ones → [41-decision-log](../process/41-decision-log.md).
- Comments explain **why**, never what. The code says what.
- A stale document is worse than no document. When something changes, the doc changes in the same PR.

## Error handling

- Never swallow an error silently.
- User-facing messages are in musicians' language: _"Couldn't load the setlist — you're offline"_, not _"Error: NetworkRequestFailed"_.
- **Never a modal error during performance mode** ([anti-patterns](../design/20-design-principles.md)). Degrade quietly and keep the show running.
- Log to crash reporting; never log personal data or file contents.

## Performance budgets

| Budget                | Target                 | Source                           |
| --------------------- | ---------------------- | -------------------------------- |
| Cold start to usable  | < 2s mid-range Android | [N1](../product/11-mvp-scope.md) |
| Repertoire scroll     | 60fps at 200 songs     | [N1](../product/11-mvp-scope.md) |
| Chart open from cache | < 1s                   | [N6](../product/11-mvp-scope.md) |
| Live sync propagation | < 2s                   | [N2](../product/11-mvp-scope.md) |

Measured on a real mid-range Android device, not a simulator. The simulator is always fast enough and always lying.

---

**Related:** [30 — Architecture](30-architecture.md) · [31 — Stack](31-stack.md) · [40 — Ways of Working](../process/40-ways-of-working.md)
