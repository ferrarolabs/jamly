# Learn — A4, what I play in this band

> What [PR 17](https://github.com/ferrarolabs/jamly/pull/17) built, why it is shaped this way, and the concepts worth knowing. For [A4 — Set what I play in this band](https://github.com/ferrarolabs/jamly/issues/16).

## The feature in one paragraph

My own row on BandHome's roster has an "Edit" button. It opens an inline editor: tap a suggestion, type anything else, remove with `×`, save. The list belongs to my **membership** (`band_members.instruments`), not to me, so it is different in every band.

## How the code is layered

```
app/index.tsx                     screen: passes bandId + my user id
└─ Roster                         picks RosterRow or MyRosterRow per member
   └─ MyRosterRow                 owns "am I editing?" + calls the hook
      └─ InstrumentsEditor        pure UI: draft state, chips, field, Save/Cancel
         uses instruments.ts      pure functions: normalise, hasInstrument
hooks/useUpdateInstruments        error state + cache update
api/band.repo.updateMyInstruments the only code that talks to Supabase
```

Each layer has one job, and that is what made it testable:

- `instruments.ts` is plain functions → plain unit tests, no mocks.
- `InstrumentsEditor` takes `onSave` as a prop → tested without a network or a QueryClient.
- `Roster` is tested with the hook mocked.
- The repo is tested with a fake Supabase builder.

Rule behind it: **screens never import the Supabase client** (`CLAUDE.md`, point 2). Swap Supabase tomorrow and only `api/` changes.

## Concepts worth knowing

### 1. Row-level security fails silently on UPDATE

Postgres RLS on an `UPDATE` does not raise when a policy filters out your row. It updates **zero rows** and reports success. So a naive `update().eq(...)` would say "saved" when nothing was saved.

The fix: chain `.select('instruments')` after the update. PostgREST then returns the updated rows (`Prefer: return=representation`). No row back = refused → `notInBand`.

Takeaway: with RLS, "no error" is not "it worked". Ask for the row back.

### 2. Two locks on the same door: policy + column grant

From `20260916090000_bands.sql`:

- The **policy** decides which _row_: `user_id = auth.uid()`.
- The **grant** decides which _columns_: `grant update (instruments)`.

So even a hacked client cannot write `role` and promote itself. The repo sending only `{ instruments }` is the app agreeing with the database, not the security boundary.

### 3. Optimistic vs confirmed updates (TanStack Query)

Optimistic: change the cache first, roll back on error. Feels instant.
Confirmed (what we did): change the cache only after the server says yes.

We chose confirmed because the acceptance criteria say a failed save must leave the old list visible. Optimistic would flash the new list, then flip back. With five people on a roster the round trip is short; the honesty is worth more.

After success: `setQueryData` updates the roster at once, then `invalidateQueries` refetches to be sure the cache matches the database.

### 4. Errors are values, not exceptions

`updateMyInstruments` never throws. It returns a discriminated union:

```ts
type UpdateInstrumentsResult =
  { ok: true; instruments: string[] } | { ok: false; failure: BandFailure };
```

TypeScript narrows on `ok`: you can only read `failure` on the branch that has one. The screen gets a message in musicians' words, never a stack trace. Same pattern as `createBand` and `joinBandByCode`.

### 5. Normalise once, in a pure function

`normaliseInstruments` trims, drops empties and de-duplicates ignoring case, first spelling wins. It runs in the editor (so no duplicate chips) **and** in the repo (so the database never gets junk). One function, two callers, one test file.

### 6. Testing React Native components (RNTL v14)

- `render` is **async** in v14: `await render(...)`.
- Query like a user: `getByRole('button', { name: 'Remove vox' })`. That is why every chip has an `accessibilityLabel` — the label is good for screen readers _and_ for tests.
- `userEvent.setup()` then `await user.press(...)` / `user.type(...)` simulates real interaction.
- Prove a test can fail: I changed the roster to show "Edit" on every row; 3 of 4 tests went red.

### 7. A jest detail that bit

`jest.mock()` factories are hoisted above imports. They may only use variables whose name starts with `mock`. `calls` failed; `mockCalls` works.

## What the device check found

Elia ran it on his phone and saw two primary buttons at once: Save in the editor and "Invite the band" under the roster. One screen should have one main action (Nielsen's heuristics: aesthetic and minimalist design, consistency and standards). The fix: the roster reports "I'm editing" up to the screen, and the screen hides Invite while the editor is open (D55).

The lesson for the agent: unit tests can't see this. Only running the app and looking at the whole screen can. That is [agent-kit issue 92](https://github.com/ferrarolabs/agent-kit/issues/92).

## What the agent's own run found

Once Supabase was reachable from the cloud session, the agent signed in with a test account on the web build and walked the feature with Playwright. Every unit test was green, and it still found a bug: offline, Save said "Something went wrong" instead of "Can't reach Jamly".

Why: when `fetch` fails, postgrest-js does not throw. It **returns** `{ error: { message: 'TypeError: Failed to fetch', code: '' } }`, a plain object. `looksOffline` only recognised real `Error` instances. The unit tests had mocked a thrown `TypeError`, a shape the library never produces for this call. The fix reads `message` from any object, and a new test uses the real shape.

Lesson: a mock is only as true as the shape you give it. Copy the shape from the real library, or from a real run.

Screenshots from that run are in [a4-instruments/](a4-instruments/).

## Decisions taken (decision log)

- D51 — editor on my own roster row, not in a Me tab: instruments are per band.
- D52 — suggestions plus free text; normalised before saving.
- D53 — empty list is valid and never prompted for.
- D54 — save is not optimistic; no row back from an update = refusal.
- D55 — one primary action at a time: Invite is hidden while I edit.

## Alternatives rejected

- **Editor in `MyProfile`.** It would need "which band?" first. Rejected (D51).
- **An enum of instruments.** Musicians play things we did not anticipate (13-domain-model).
- **A modal or a new route for the editor.** Inline is fewer taps and keeps the roster in view, so a failed save visibly changes nothing.
- **An RPC `set_my_instruments()`.** Not needed: the grant and policy already make a direct table update safe.

## Where to look

- `src/features/band/api/band.repo.ts` — `updateMyInstruments`
- `src/features/band/hooks/useUpdateInstruments.ts`
- `src/features/band/components/InstrumentsEditor.tsx`, `MyRosterRow.tsx`
- `src/features/band/instruments.ts`
- Tests: `src/features/band/**/__tests__/`
