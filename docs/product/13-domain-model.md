# 13 — Domain Model

> The **ubiquitous language** of Jamly. These names are used identically in conversation, in the UI, in the TypeScript types (`src/types/`) and in the database ([32-data-model](../tech/32-data-model.md)). When they drift, bugs and bad UX follow.
>
> **Rule:** use musicians' words, not software words. A `Setlist` is never a `Playlist`. An `Event` is never a `Task`.

---

## The central idea: two layers on one object

Everything that makes Jamly different comes from this one structural decision:

```
                    ┌───────────────────────────────┐
                    │           SONG                │
                    │  (the band's shared truth)    │
                    │  title, artist, key, tempo,   │
                    │  duration, status, charts     │
                    └───────────────┬───────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
     ┌────────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
     │  SongPersonal   │   │  SongPersonal   │   │  SongPersonal   │
     │    (Marco)      │   │     (Sara)      │   │     (Luca)      │
     │  my notes       │   │  my notes       │   │  my notes       │
     │  my confidence  │   │  my confidence  │   │  my confidence  │
     │  my chart       │   │  my chart       │   │  my chart       │
     │  my practice ───┼───┼─── log ─────────┼───┼─── history      │
     └─────────────────┘   └─────────────────┘   └─────────────────┘
        band layer above ─── personal layer below
```

The band layer is what everyone agreed on. The personal layer is what only you see. **No competitor holds both** ([02-market Gap 2](../business/02-market-and-competitors.md)), and the personal layer is where v0.2's practice features and the entire long-term moat plug in.

This is why `SongPersonal` exists in v0.1 even though it only carries notes at first ([story B5](11-mvp-scope.md)).

---

## Entity relationship overview

```
   User ──< BandMembership >── Band
    │                            │
    │                            ├──< Song >──── Chart (file)
    │                            │      │
    │                            │      └──< SetlistItem >── Setlist ──1:1── Event
    │                            │                                            │
    │                            └──< Event >──< EventAttendance >─── User ────┘
    │
    ├──< SongPersonal >── Song            (personal layer — v0.1)
    ├──< PracticeSession >── Song          (v0.2)
    ├──< Payout >── Event                  (v0.3)
    └──< GearSetup >                       (v0.4)

   LiveSession ── Event   (ephemeral, realtime — not durable state)
```

---

## Core entities (v0.1)

### `User`

A person. Exists independently of any band — Jamly follows the musician, not the group. A user may belong to several bands (multi-band is v0.2, but the model supports it from day one).

| Field                   | Type      | Notes                                                                                                              |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `id`                    | uuid      |                                                                                                                    |
| `email`                 | string    | Auth identity. Password today, email OTP later ([ADR-0008](../tech/adr/0008-email-password-auth-now-otp-later.md)) |
| `display_name`          | string?   | Optional, asked once inline                                                                                        |
| `avatar_url`            | string?   |                                                                                                                    |
| `plan`                  | enum      | `free_unlimited` in Phase 1. Exists now so Phase 2 is config, not refactor                                         |
| `plan_grandfathered_at` | timestamp | Enforces the [migration rule](../business/05-business-model.md)                                                    |
| `created_at`            | timestamp |                                                                                                                    |

### `Band`

A group of musicians who play together. The unit of sharing, and the unit of the north-star metric.

| Field         | Type        | Notes                                |
| ------------- | ----------- | ------------------------------------ |
| `id`          | uuid        |                                      |
| `name`        | string      | The only required field to exist     |
| `invite_code` | string      | Powers the link-join flow. Rotatable |
| `created_by`  | uuid → User |                                      |
| `created_at`  | timestamp   |                                      |

> A band exists with **only a name**. Every other attribute (genre, logo, description) is deliberately absent — each one is a field Marco must fill before getting value ([R2](../business/06-risks-and-open-questions.md)).

### `BandMembership`

The join between User and Band, carrying role and instruments. A user's identity _within_ a band.

| Field                 | Type      | Notes                                                                                              |
| --------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| `id`                  | uuid      |                                                                                                    |
| `band_id` / `user_id` | uuid      | Unique together                                                                                    |
| `role`                | enum      | `leader` \| `member`. Leaders can edit shared data and drive live sync                             |
| `instruments`         | string[]  | Free-form (`"drums"`, `"bass"`, `"vox"`). Not an enum — musicians play things we didn't anticipate |
| `joined_at`           | timestamp |                                                                                                    |

### `Song`

A song **in a band's repertoire**. Not a global song record.

> **Deliberate decision:** songs are scoped to a band, not shared globally. Two bands playing "Superstition" have two `Song` rows. This costs some duplication and buys enormous simplicity — plus it keeps every chart inside a private band boundary ([ADR-0007](../tech/adr/0007-copyright-user-generated-charts-only.md)). A global song catalogue would be an entirely different, licence-encumbered product.

| Field                       | Type        | Notes                                                                                                                             |
| --------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `id`                        | uuid        |                                                                                                                                   |
| `band_id`                   | uuid → Band |                                                                                                                                   |
| `title` / `artist`          | string      | Title required; artist strongly encouraged                                                                                        |
| `song_key`                  | string?     | `"Bb"`, `"Am"`. Text, not an enum — modal and unusual keys exist. Named `song_key` because `key` is reserved in too many contexts |
| `tempo_bpm`                 | int?        |                                                                                                                                   |
| `duration_seconds`          | int?        | Feeds setlist running-time                                                                                                        |
| `status`                    | enum        | `learning` \| `rehearsing` \| `ready` \| `retired`                                                                                |
| `notes`                     | text?       | **Band-shared** notes — arrangement, cues, endings. Distinct from personal notes                                                  |
| `created_by` / `created_at` |             |                                                                                                                                   |

### `Chart`

A file attached to a song: PDF, image, later ChordPro text. **Always private to its band.**

| Field                        | Type    | Notes                                                                                                |
| ---------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `id`                         | uuid    |                                                                                                      |
| `song_id` / `band_id`        | uuid    | `band_id` denormalized for RLS and storage-quota queries                                             |
| `kind`                       | enum    | `pdf` \| `image` \| `chordpro` (v0.3)                                                                |
| `storage_path`               | string  | Private bucket. Never a public URL                                                                   |
| `title`                      | string? | e.g. `"Bass chart"`                                                                                  |
| `for_instrument`             | string? | Enables per-member charts (v0.2, `F112`)                                                             |
| `size_bytes`                 | int     | **Recorded from day one** — storage is the real cost driver ([05](../business/05-business-model.md)) |
| `uploaded_by` / `created_at` |         |                                                                                                      |

### `SongPersonal` ⭐ _the seam_

One row per (song × user). The personal layer.

| Field                 | Type      | Notes                                                                                                                       |
| --------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `id`                  | uuid      |                                                                                                                             |
| `song_id` / `user_id` | uuid      | Unique together                                                                                                             |
| `notes`               | text?     | Private. Never visible to bandmates — enforced by RLS                                                                       |
| `confidence`          | int?      | 1–5, self-rated. Unused in v0.1 UI, **modelled now** because v0.2's practice list and the "are we ready?" view depend on it |
| `updated_at`          | timestamp |                                                                                                                             |

### `Event`

Something the band does at a time and place. Rehearsals and gigs are the same entity with a type — they share every field that matters, and splitting them would double the code for no gain.

| Field                          | Type         | Notes                                                |
| ------------------------------ | ------------ | ---------------------------------------------------- |
| `id`                           | uuid         |                                                      |
| `band_id`                      | uuid → Band  |                                                      |
| `type`                         | enum         | `rehearsal` \| `gig` (later: `recording`, `writing`) |
| `title`                        | string?      | Defaults from type + venue                           |
| `starts_at`                    | timestamptz  | Timezone-aware — bands travel                        |
| `ends_at`                      | timestamptz? |                                                      |
| `venue_name` / `venue_address` | string?      |                                                      |
| `load_in_at`                   | timestamptz? | Gigs                                                 |
| `notes`                        | text?        |                                                      |
| `fee_amount` / `fee_currency`  |              | **v0.3** — modelled here, not exposed in v0.1        |
| `created_by` / `created_at`    |              |                                                      |

### `EventAttendance`

Who's coming. One row per (event × user).

| Field                  | Type      | Notes                                    |
| ---------------------- | --------- | ---------------------------------------- |
| `event_id` / `user_id` | uuid      | Unique together                          |
| `status`               | enum      | `yes` \| `no` \| `maybe` \| `unanswered` |
| `updated_at`           | timestamp |                                          |

### `Setlist`

The ordered plan of what gets played at an event.

| Field                       | Type    | Notes                                                                       |
| --------------------------- | ------- | --------------------------------------------------------------------------- |
| `id`                        | uuid    |                                                                             |
| `band_id` / `event_id`      | uuid    | One setlist per event in v0.1; the model allows several (templates, `F116`) |
| `name`                      | string? |                                                                             |
| `created_by` / `updated_at` |         |                                                                             |

### `SetlistItem`

A position in a setlist. Either a song or a break — modelling breaks as items is what makes running-time arithmetic work.

| Field          | Type    | Notes                                               |
| -------------- | ------- | --------------------------------------------------- |
| `id`           | uuid    |                                                     |
| `setlist_id`   | uuid    |                                                     |
| `song_id`      | uuid?   | Null when `kind = break`                            |
| `kind`         | enum    | `song` \| `break` \| `set_marker`                   |
| `position`     | int     | Order within the setlist                            |
| `set_number`   | int     | Which set (1, 2, …) — drives per-set totals         |
| `label`        | string? | For breaks/markers: `"Break"`, `"Encore"`           |
| `notes`        | string? | Performance note: `"straight into the next one"`    |
| `override_key` | string? | When this song is played in a different key tonight |

### `LiveSession` — ephemeral

The live sync state during a rehearsal or show. **Not durable data.** It's a realtime channel keyed by event, carrying the leader's current position.

| Field             | Type      | Notes                   |
| ----------------- | --------- | ----------------------- |
| `event_id`        | uuid      | Channel key             |
| `current_item_id` | uuid      | Where the leader is now |
| `driver_user_id`  | uuid      | Who's driving           |
| `updated_at`      | timestamp |                         |

> Modelled as transient state, not a table, in v0.1 ([ADR-0004](../tech/adr/0004-realtime-setlist-sync-transport.md)). If the session dies, the setlist is untouched — losing a live session must never risk the band's actual data.

---

## Future entities (modelled, not built)

Listed so the v0.1 schema doesn't paint us into a corner.

| Entity            | Release | Shape                                                                                         |
| ----------------- | ------- | --------------------------------------------------------------------------------------------- |
| `PracticeSession` | v0.2    | user × song? × duration × date × notes. Powers `F401`/`F404`                                  |
| `PracticeItem`    | v0.2    | Generated from an upcoming setlist + low `SongPersonal.confidence`. **The ⭐ feature `F403`** |
| `Payout`          | v0.3    | event × user × amount × paid_at. Answers "who's been paid"                                    |
| `Expense`         | v0.3    | band × amount × paid_by × split                                                               |
| `GearSetup`       | v0.4    | user × instrument × structured values × photos × public flag                                  |
| `Venue`           | ?       | Promoted from `Event.venue_name` once repetition proves it's worth it                         |

---

## Naming conventions

| Concept                      | We say                           | We never say                       |
| ---------------------------- | -------------------------------- | ---------------------------------- |
| The ordered plan for a show  | **Setlist**                      | Playlist, Program, Queue           |
| A song in the band's list    | **Song** (in the **Repertoire**) | Track, Item, Piece                 |
| Sheet music or a chord sheet | **Chart**                        | Score, Document, Attachment        |
| A rehearsal or gig           | **Event**                        | Booking, Appointment, Task         |
| The people in a band         | **Members**                      | Users, Participants, Collaborators |
| The stage view during a show | **Performance mode**             | Presentation mode, Live view       |

Database: `snake_case`, plural tables (`songs`, `setlist_items`). TypeScript: `PascalCase` types, `camelCase` fields, mapped at the data layer ([33-conventions](../tech/33-conventions.md)).

---

## Invariants

Rules the system must never violate. Each becomes a database constraint or an RLS policy ([32-data-model](../tech/32-data-model.md)).

1. A `User` sees data from a `Band` **only** through an active `BandMembership`. Enforced at the database, never in the client. _(N7)_
2. A `Chart` file is reachable **only** by members of its band. No public URLs, ever.
3. `SongPersonal.notes` is visible to exactly one user — its owner. Bandmates included in "no one else".
4. A `Setlist` belongs to one `Event`; an `Event` belongs to one `Band`. No cross-band references anywhere.
5. Deleting a `Song` must not orphan `SetlistItem`s — cascade or soft-delete, never a dangling reference.
6. Every `Band` has at least one `leader`. The last leader cannot leave without promoting someone.
7. A `LiveSession` is ephemeral. Its loss never alters durable data.

---

**Related:** [11 — MVP Scope](11-mvp-scope.md) · [32 — Data Model](../tech/32-data-model.md) · [30 — Architecture](../tech/30-architecture.md) · [ADR-0007](../tech/adr/0007-copyright-user-generated-charts-only.md)
