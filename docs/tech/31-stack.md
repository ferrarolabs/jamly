# 31 — Stack

> Every dependency, and why it's here. A dependency without a reason is a liability — for a solo project, each one is something that can break, go unmaintained, or need migrating.

---

## Client

| Choice                                              | Version target      | Why                                                                                                                                                                                        | ADR                                                  |
| --------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| **Expo**                                            | SDK 57 (`57.0.19`)  | iOS + Android + web + future desktop from one codebase. Managed builds (EAS) remove native toolchain maintenance — significant for a solo dev.                                             | [0001](adr/0001-cross-platform-expo-react-native.md) |
| **React Native**                                    | 0.86.3              | Comes with the SDK. New Architecture (Fabric/TurboModules) is mandatory from SDK 55 — no legacy bridge option exists.                                                                      | [0001](adr/0001-cross-platform-expo-react-native.md) |
| **React**                                           | 19.2.3              | Comes with the SDK.                                                                                                                                                                        |                                                      |
| **TypeScript**                                      | 6.x, `strict: true` | Types are the documentation that can't rot. Non-negotiable for a project returned to after gaps.                                                                                           |                                                      |
| **Expo Router**                                     | 57.x                | File-based routing, familiar from web. **Deep links come free — and the invite link is the single most important flow in the product** ([R2](../business/06-risks-and-open-questions.md)). |                                                      |
| **Zustand**                                         | 5.x                 | ~1KB, no boilerplate, no context gymnastics. UI state only. _(Not yet installed — added with the first stateful screen.)_                                                                  |                                                      |
| **TanStack Query**                                  | 5.x                 | Server-state caching, revalidation, optimistic updates. The offline-first read pattern is largely its job.                                                                                 |                                                      |
| **expo-sqlite**                                     | 57.x                | Local persistent cache. First-party, no extra native config.                                                                                                                               | [0003](adr/0003-offline-first-sync-strategy.md)      |
| **react-native-reanimated**                         | 4.x                 | Drag-to-reorder setlists and smooth performance-mode transitions.                                                                                                                          |                                                      |
| **@shopify/flash-list**                             | 2.3.x               | A 200-song repertoire must scroll without jank ([N1](../product/11-mvp-scope.md)).                                                                                                         |                                                      |
| **react-native-pdf** _(or `expo-image` + a viewer)_ | —                   | Chart display. **Evaluate during build** — PDF rendering is the least certain client dependency.                                                                                           |                                                      |
| **date-fns**                                        | 4.x                 | Date maths without Moment's weight. Timezone-aware — bands travel.                                                                                                                         |                                                      |
| **expo-secure-store**                               | SDK-matched         | Session token storage.                                                                                                                                                                     |                                                      |
| **expo-keep-awake**                                 | SDK-matched         | The screen must not sleep during a show. Small dependency, large consequence.                                                                                                              |                                                      |
| **expo-dev-client**                                 | SDK-matched         | **Required to run the app at all.** Expo Go is frozen at SDK 54 and no SDK 57 build exists, so the dev client _is_ the development runtime — not an optional upgrade.                      |                                                      |

**Deliberately not used:**

- **A UI component library** (NativeBase, Tamagui, gluestack). The stage-readable dark theme is a differentiator ([Rule 3](../design/20-design-principles.md)); fighting a library's defaults costs more than a small in-house kit.
- **Redux / MobX.** Zustand + TanStack Query covers everything at this size.
- **A styling framework.** RN `StyleSheet` with design tokens. Fewer moving parts.
- **Expo UI universal components.** New in SDK 56 and appealing, but the design requires precise control. Revisit later.

## Backend

| Choice                | Why                                                                                                                                                                                         | ADR                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Supabase**          | Postgres + Auth + Realtime + Storage + RLS in one managed platform. The realtime and row-level-security pieces are exactly what Jamly needs, and are the two hardest things to build alone. | [0002](adr/0002-backend-supabase-postgres.md)            |
| **PostgreSQL**        | Real SQL. Genuine fullstack learning value, and relational data is the right shape for bands↔songs↔setlists.                                                                                | [0002](adr/0002-backend-supabase-postgres.md)            |
| **Supabase Auth**     | Email + password today, email OTP once a transactional email provider exists. Sessions in the OS keystore.                                                                                  | [0008](adr/0008-email-password-auth-now-otp-later.md)    |
| **Supabase Realtime** | Broadcast channels for live setlist sync — the ephemeral-by-design transport this feature needs.                                                                                            | [0004](adr/0004-realtime-setlist-sync-transport.md)      |
| **Supabase Storage**  | Private buckets for charts. Legally mandatory that these are private.                                                                                                                       | [0007](adr/0007-copyright-user-generated-charts-only.md) |
| **Supabase CLI**      | Local development and versioned migrations. **Schema is never edited in the dashboard.**                                                                                                    |                                                          |

**Deliberately not used:** Firebase (NoSQL fits this relational domain badly, and teaches less); a custom Node/Nest API (nothing needs it yet); Appwrite/PocketBase (smaller ecosystems, more to operate).

## Tooling

| Choice                                                       | Why                                                                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| **ESLint** + `eslint-config-expo`                            | Catches the boring mistakes                                                                       |
| **Prettier**                                                 | Formatting is not worth a decision                                                                |
| **Jest** (`jest-expo` preset) + React Native Testing Library | Standard for RN; component tests where they earn their keep                                       |
| **babel-preset-expo**                                        | Required explicitly as a devDependency for the Jest transform — it is not resolvable transitively |
| **Maestro**                                                  | E2E on real device flows, simple YAML                                                             |
| **GitHub Actions**                                           | Typecheck + lint + test on every PR                                                               |
| **EAS Build / EAS Update**                                   | Cloud builds without local Xcode/Android SDK pain; OTA updates for JS-only fixes                  |

## Accounts & costs

| Service         | Cost                                                                                     |
| --------------- | ---------------------------------------------------------------------------------------- |
| Supabase        | Free tier during Phase 1; ~$25/mo if it outgrows it                                      |
| Expo EAS        | Free tier sufficient at this cadence                                                     |
| Apple Developer | **€99/year** — required to ship to iOS. Budget before launch, not at launch              |
| Google Play     | $25 one-time                                                                             |
| GitHub          | Free                                                                                     |
| Domain          | ~€15/year once the name is confirmed ([R10](../business/06-risks-and-open-questions.md)) |

**Phase 1 target: €0/month running cost**, with the Apple fee the only unavoidable outlay before an iOS launch ([05-business-model](../business/05-business-model.md)).

## Version policy

- **Expo uses unified versioning from SDK 57**: first-party packages carry the SDK's major
  version (`expo-router@57.x`, `expo-sqlite@57.x`), not independent version lines. Don't
  hand-write these — `npx expo install` resolves them.
- **Pin the Expo SDK.** Upgrade deliberately, one SDK at a time, never mid-milestone.
- Let `expo install` choose versions for Expo-managed packages — it resolves SDK-compatible ones.
- Renovate/Dependabot for security patches only. Chasing minor versions is not progress.
- **Every dependency added must be justified in this table.** If it isn't worth a row here, it isn't worth shipping.

---

**Related:** [30 — Architecture](30-architecture.md) · [33 — Conventions](33-conventions.md) · [ADRs](adr/README.md)
