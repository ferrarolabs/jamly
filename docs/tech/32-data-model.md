# 32 — Data Model

> The concrete schema for v0.1. Implements [13-domain-model](../product/13-domain-model.md) and is mirrored by `supabase/migrations/0001_init.sql`.
>
> **The two documents must agree.** If they diverge, the migration is the truth and this document is a bug.

---

## Conventions

- `snake_case`, plural table names
- Every table: `id uuid primary key default gen_random_uuid()`, `created_at timestamptz not null default now()`
- Mutable tables also carry `updated_at timestamptz`, maintained by a trigger
- Foreign keys are always explicit, with a deliberate `on delete` behaviour
- Timestamps are **always** `timestamptz` — bands travel across timezones and a gig at "21:00" must survive it
- Enums are Postgres `enum` types where the set is genuinely closed, `text` where musicians will surprise us (instruments, keys)

---

## Tables

### `profiles`

Mirrors `auth.users` with app-level fields. Supabase owns `auth.users`; we never write to it directly.

```sql
create table profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  display_name          text,
  avatar_url            text,
  plan                  user_plan not null default 'free_unlimited',
  plan_grandfathered_at timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
```

`plan` and `plan_grandfathered_at` exist in v0.1 despite everything being free — they make the Phase 2 switch a configuration change and make the [migration rule](../business/05-business-model.md) technically enforceable.

A row appears with its auth user and disappears with it, both by trigger on `auth.users` — so there is no insert or delete policy, and the app never deals with a signed-in user who has no profile. Reads and updates are the owner's own row only, and `plan` is withheld at the **column** level:

```sql
revoke all on table profiles from anon, authenticated;
grant select on table profiles to authenticated;
grant update (display_name, avatar_url) on table profiles to authenticated;
```

The policy decides which _row_ may be written; the grant decides which _columns_. Without the second, a client holding a valid session could promote itself to `pro`.

### `bands`

```sql
create table bands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) > 0),
  invite_code text not null unique default encode(gen_random_bytes(9), 'base64'),
  created_by  uuid not null references profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on bands (invite_code);
```

Only `name` is required — every additional required field is friction on the path to value ([Rule 2](../design/20-design-principles.md)). `invite_code` is rotatable if a link leaks.

### `band_members`

```sql
create table band_members (
  id          uuid primary key default gen_random_uuid(),
  band_id     uuid not null references bands(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        member_role not null default 'member',   -- leader | member
  instruments text[] not null default '{}',
  joined_at   timestamptz not null default now(),
  unique (band_id, user_id)
);
create index on band_members (user_id);
create index on band_members (band_id);
```

**This is the most important table in the schema** — every RLS policy resolves through it, so its indexes matter for both correctness and performance.

`instruments` is `text[]`, not an enum: musicians play things we didn't anticipate, and "vox + rhythm guitar + occasional harmonica" must be expressible.

### `songs`

```sql
create table songs (
  id               uuid primary key default gen_random_uuid(),
  band_id          uuid not null references bands(id) on delete cascade,
  title            text not null check (length(trim(title)) > 0),
  artist           text,
  song_key         text,           -- "Bb", "Am", "D dorian" — text, not an enum
  tempo_bpm        int check (tempo_bpm between 20 and 400),
  duration_seconds int check (duration_seconds > 0),
  status           song_status not null default 'learning',
  notes            text,           -- BAND-SHARED notes (arrangement, cues)
  created_by       uuid references profiles(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index on songs (band_id);
create index on songs (band_id, status);
```

Songs are **band-scoped, not global** — see the reasoning in [13-domain-model](../product/13-domain-model.md). Note `notes` here is the _shared_ note; the private one lives in `song_personal`.

### `charts`

```sql
create table charts (
  id             uuid primary key default gen_random_uuid(),
  song_id        uuid not null references songs(id) on delete cascade,
  band_id        uuid not null references bands(id) on delete cascade,  -- denormalized for RLS + quotas
  kind           chart_kind not null,      -- pdf | image | chordpro
  storage_path   text not null,            -- private bucket path. NEVER a public URL
  title          text,
  for_instrument text,
  size_bytes     bigint not null default 0,
  uploaded_by    uuid references profiles(id),
  created_at     timestamptz not null default now()
);
create index on charts (song_id);
create index on charts (band_id);
```

`band_id` is denormalized deliberately: it keeps the RLS policy a single-join lookup and makes per-band storage totals a trivial `sum(size_bytes)`.

`size_bytes` is recorded **from the first upload**, while storage is unlimited — storage is the only real marginal cost in the system ([05-business-model](../business/05-business-model.md)).

### `song_personal` ⭐ the seam

```sql
create table song_personal (
  id         uuid primary key default gen_random_uuid(),
  song_id    uuid not null references songs(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  notes      text,
  confidence int check (confidence between 1 and 5),
  updated_at timestamptz not null default now(),
  unique (song_id, user_id)
);
create index on song_personal (user_id);
```

Small table, largest strategic weight in the schema. `confidence` is unused by the v0.1 UI and modelled now because v0.2's practice list (`F403`) and readiness view (`F405`) depend on it — the moat is built on this column.

### `events`

```sql
create table events (
  id            uuid primary key default gen_random_uuid(),
  band_id       uuid not null references bands(id) on delete cascade,
  type          event_type not null,      -- rehearsal | gig
  title         text,
  starts_at     timestamptz not null,
  ends_at       timestamptz,
  venue_name    text,
  venue_address text,
  load_in_at    timestamptz,
  notes         text,
  fee_amount    numeric(10,2),            -- v0.3, modelled now
  fee_currency  char(3) default 'EUR',    -- v0.3
  created_by    uuid references profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on events (band_id, starts_at);
```

`(band_id, starts_at)` is the index behind the single most-used query in the app: _the next event for this band_ ([story C2](../product/11-mvp-scope.md)).

### `event_attendance`

```sql
create table event_attendance (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  status     attendance_status not null default 'unanswered',
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);
```

### `setlists`

```sql
create table setlists (
  id         uuid primary key default gen_random_uuid(),
  band_id    uuid not null references bands(id) on delete cascade,
  event_id   uuid references events(id) on delete set null,
  name       text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on setlists (band_id);
create index on setlists (event_id);
```

`on delete set null` on `event_id`: deleting a gig must not destroy the set you spent an hour building.

### `setlist_items`

```sql
create table setlist_items (
  id           uuid primary key default gen_random_uuid(),
  setlist_id   uuid not null references setlists(id) on delete cascade,
  song_id      uuid references songs(id) on delete restrict,
  kind         setlist_item_kind not null default 'song',  -- song | break | set_marker
  position     int not null,
  set_number   int not null default 1,
  label        text,
  notes        text,
  override_key text,
  created_at   timestamptz not null default now(),
  check (kind <> 'song' or song_id is not null)
);
create index on setlist_items (setlist_id, position);
```

`on delete restrict` on `song_id` implements invariant 5 ([13-domain-model](../product/13-domain-model.md)): deleting a song that's in a setlist must fail loudly rather than silently corrupting a set. The app soft-deletes or warns instead.

`position` as an int is intentionally simple. Reordering rewrites positions in a transaction — with sets of 20–40 items, fractional indexing would be premature cleverness.

### Enum types

```sql
create type user_plan         as enum ('free_unlimited', 'free', 'pro');
create type member_role       as enum ('leader', 'member');
create type song_status       as enum ('learning', 'rehearsing', 'ready', 'retired');
create type chart_kind        as enum ('pdf', 'image', 'chordpro');
create type event_type        as enum ('rehearsal', 'gig');
create type attendance_status as enum ('yes', 'no', 'maybe', 'unanswered');
create type setlist_item_kind as enum ('song', 'break', 'set_marker');
```

---

## Row-level security

**RLS is the security boundary.** The client is untrusted. A bug in the app must not be able to leak another band's data ([N7](../product/11-mvp-scope.md)).

Enable on every table:

```sql
alter table <t> enable row level security;
```

### The core predicate

Every band-scoped policy reduces to one helper:

```sql
create or replace function is_band_member(b uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from band_members
    where band_id = b and user_id = auth.uid()
  );
$$;
```

### Policy pattern

```sql
-- read: members of the band
create policy "members read songs" on songs
  for select using (is_band_member(band_id));

-- write: members of the band
create policy "members write songs" on songs
  for insert with check (is_band_member(band_id));
create policy "members update songs" on songs
  for update using (is_band_member(band_id));

-- delete: leaders only
create policy "leaders delete songs" on songs
  for delete using (
    exists (select 1 from band_members
            where band_id = songs.band_id
              and user_id = auth.uid()
              and role = 'leader')
  );
```

Applied identically to `songs`, `charts`, `events`, `event_attendance`, `setlists`, `setlist_items` (the last two resolving `band_id` through their parent).

### The personal exception

```sql
create policy "own personal rows only" on song_personal
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

**Bandmates are included in "no one else".** Invariant 3.

### Joining a band

Joining needs a controlled path — a user who isn't yet a member can't be granted read access to `bands` by the normal policy. A `security definer` function looks up the band by `invite_code` and inserts the membership:

```sql
create or replace function join_band_by_code(code text)
returns uuid language plpgsql security definer as $$ ... $$;
```

This is the only place where privilege is deliberately elevated, and it does exactly one thing.

### Storage

Private bucket `charts`, paths `band/{band_id}/song/{song_id}/{uuid}.pdf`. Storage policies apply the same `is_band_member()` check against the `band_id` segment of the path. Access is only ever via short-lived signed URLs.

---

## Testing the policies

**The highest-value tests in the project.** A broken policy is a data breach, and no UI test will catch it.

Minimum set, run against a local Supabase in CI:

1. User in band A cannot `select` band B's songs, charts, events, setlists
2. User in band A cannot `insert` into band B
3. A non-member cannot read a band at all
4. User A cannot read user B's `song_personal` rows — same band included
5. A non-leader cannot delete a song
6. A signed URL for band A's chart is not obtainable by a member of band B
7. `join_band_by_code` with an invalid code fails cleanly

---

## Migrations

| File                                                      | Contents                                                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `20260909220000_profiles.sql`                             | `user_plan` enum, `profiles`, its policies and grants, the `auth.users` triggers, `set_updated_at()` |
| `20260909223000_move_trigger_functions_out_of_public.sql` | Moves the three trigger functions into a `private` schema, out of the PostgREST-exposed API          |

Tables arrive with the feature that needs them (D28), so this table is the schema until the next feature is built. The full v0.1 schema this document describes exists in git at `88b39e7` and is reintroduced a table at a time.

Rules: forward-only, never edited after being applied to production, applied to staging first, never a manual dashboard change ([30-architecture](30-architecture.md)).

---

## Deferred schema (do not build yet)

Recorded so v0.1 doesn't paint us into a corner:
`practice_sessions` (v0.2) · `payouts`, `expenses` (v0.3) · `gear_setups` (v0.4) · `venues` (?)

None of them require changes to the v0.1 tables — verified by tracing each future entity's foreign keys against the schema above.

---

**Related:** [13 — Domain Model](../product/13-domain-model.md) · [30 — Architecture](30-architecture.md) · [ADR-0007](adr/0007-copyright-user-generated-charts-only.md)
