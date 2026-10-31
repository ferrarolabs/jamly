# 11 — MVP Scope (v0.1)

> **This document is a contract.** Anything not listed here is not built in v0.1, no matter how small it looks. New ideas go to [10-feature-inventory](10-feature-inventory.md).

---

## The goal of v0.1

> **A real band uses Jamly for one rehearsal and one gig, end to end, without the developer in the room.**

Not "the features are done". Not "it compiles". A band — ideally not the developer's own — runs a real gig on it and the app doesn't get in the way.

## The wedge

**The rehearsal-to-gig loop:**

```
   Band exists          Repertoire            Setlist for            Live on
   & everyone's    →    of songs         →    Saturday's       →     stage,
   actually in it       we play               gig                    in sync
      F201                 F101                  F103                  F105
```

Everything in v0.1 serves that loop. Nothing else is in it.

## Explicitly OUT of v0.1

Named so they can't creep in: money & payouts (v0.3) · practice tracking (v0.2) · gear presets (v0.4) · the music wiki (v1.0+) · band chat (never) · calendar sync (v0.2) · push notifications (v0.2) · multi-band (v0.2) · offline _writes_ (v0.2 — v0.1 is offline _read_) · light theme (v0.2) · web build (v0.3) · ChordPro/transposition (v0.3) · annotation · auto-scroll · library import from OnSong/forScore.

---

## User stories

Each story traces to a persona job in [03-personas-and-jtbd](../business/03-personas-and-jtbd.md) and to feature IDs in [10-feature-inventory](10-feature-inventory.md).

### Epic A — Getting the band in _(the make-or-break epic)_

> This epic decides whether the product succeeds. See [R2](../business/06-risks-and-open-questions.md). If onboarding is mediocre, nothing downstream matters.

**A1 — Sign in without ceremony** · `F601`, `F606` · P1, P2

> As a musician, I want to get into the app without filling in a registration form before I've seen anything.

- Email + password ([ADR-0008](../tech/adr/0008-email-password-auth-now-otp-later.md)). No username, no profile setup wizard, no self-serve sign-up while Jamly is invite-only.
- Display name is asked for **once**, inline, and can be skipped.
- Autofill works, so the second sign-in on a device is one tap.
- **AC:** from opening the app to being signed in: two fields and one button, and a returning musician is never asked again.
- **Passwordless (`F607`) supersedes this** once a transactional email provider exists: email → six-digit code → in.

**A2 — Create a band** · `F201` · P1

> As a band leader, I want to create my band and get an invite link immediately, so I can paste it in our group chat right now.

- Band needs only a name to exist.
- The invite link is presented **immediately after creation**, not hidden in settings.
- One tap to share it to WhatsApp.
- **AC:** band created and link shared in ≤ 60 seconds from a signed-in state.

**A3 — Join a band from a link** ⭐ · `F201` · P2

> As a band member, I want to tap the link my band leader sent and be in, so that I don't have to learn anything.

- The deep link opens the app (or the store, then the app) and lands directly on the join screen.
- Sign-in is folded into the join flow — never a separate wall before it.
- After joining, the user lands on the band's home screen with **real content already visible** — never an empty state, never a tutorial.
- **AC (the hardest number in v0.1):** **from tapping the link to seeing the band's next event: under 30 seconds and no more than 4 taps**, for a user who has never heard of Jamly.

**A4 — Set who I am in this band** · `F202` · P1, P2

> As a member, I want to say what I play, so the band knows who's who.

- Instrument(s) and role (leader/member). Both optional, editable later, never blocking.
- **AC:** skippable without any nag.

### Epic B — The repertoire

**B1 — Add a song to the repertoire** · `F101` · P1

> As a band leader, I want to add the songs we play, with the details that matter live.

- Title and artist required; key, tempo (BPM), duration optional.
- Adding a song is one screen. No wizard, no required category.
- **AC:** a song added in under 15 seconds with title + artist only.

**B2 — See the repertoire** · `F101` · P1, P2

> As a member, I want to see everything the band plays, sorted and searchable.

- List with title, artist, key, duration, status. Search by title/artist. Sort by title, artist, recently added.
- **AC:** a 100-song repertoire is legible and searchable without lag.

**B3 — Track how ready a song is** · `F102` · P1

> As a band leader, I want to mark whether a song is being learned, rehearsed, or gig-ready.

- Status: `learning` · `rehearsing` · `ready` · `retired`. Visible in the list, changeable in one tap.
- **AC:** filter the repertoire by status.

**B4 — Attach a chart to a song** · `F107` · P1, P2

> As a member, I want the chart for a song attached to the song, so I never hunt for a PDF again.

- Upload PDF or image from the device. Multiple files per song. Any member can upload.
- Files are **private to the band** — enforced at the storage layer, non-negotiable ([ADR-0007](../tech/adr/0007-copyright-user-generated-charts-only.md)).
- **AC:** upload a PDF and open it from the song, on both platforms.

**B5 — My private notes on a song** · `F110` · P2, P3

> As a member, I want my own notes on a song that only I see — the personal layer, present from day one.

- Free text, attached to (song × me), never visible to other members.
- **AC:** two members' notes on the same song don't collide, and neither can see the other's.

> **B5 looks trivial and is architecturally the most important story in v0.1.** It establishes the band-layer / personal-layer seam that the entire v0.2+ moat is built on ([02-market Gap 2](../business/02-market-and-competitors.md)). Get the data model right here.

### Epic C — Events

**C1 — Create a rehearsal or a gig** · `F203` `F206` · P1

> As a band leader, I want to put a date on the calendar once, so nobody asks again.

- Type (`rehearsal` | `gig`), date, start time, venue name. Optional: address, load-in time, notes.
- **AC:** created in under 30 seconds.

**C2 — See what's next** · `F204` · P2

> As a member, I want the next thing my band is doing to be the first thing I see.

- **The next event is the top of the band home screen.** Not in a tab, not behind navigation.
- Shows: what, when, where, how far away, and its setlist if one exists.
- **AC:** a member who opens the app cold sees the next event within one second of the home screen rendering, with zero taps.

**C3 — Say if I'm coming** · `F205` · P1, P2

> As a member, I want to mark my availability, so the leader stops chasing people.

- Yes / No / Maybe, one tap, from the home screen.
- The leader sees the full roster's answers at a glance.
- **AC:** answerable in one tap from the home screen without opening the event.

### Epic D — Setlists

**D1 — Build a setlist for an event** · `F103` · P1

> As a band leader, I want to build the set for Saturday by picking from our repertoire and dragging it into order.

- Pick songs from the repertoire, reorder by drag-and-drop, remove.
- One setlist per event in v0.1 (multiple named sets is v0.2).
- **AC:** a 20-song setlist built and reordered smoothly on a phone.

**D2 — Sets and running time** · `F104` · P1

> As a band leader, I want to split the show into sets with breaks and see the total running time.

- Divide into blocks ("Set 1", "Break", "Set 2"). Running total per set and overall, computed from song durations.
- **AC:** total duration updates live as songs are added/removed.

**D3 — See the setlist** · `F103` · P2

> As a member, I want to see the set before and during the show, and know it's the current version.

- Read-only view for non-leaders. Numbered, with key and duration per song.
- **AC:** all members see identical content; a change by the leader appears for everyone.

### Epic E — Performance mode _(the differentiator to prove)_

**E1 — Stage-readable current song** · `F106` · P2

> As a member on a dark stage, I want to see what we're playing now and what's next, readable at arm's length.

- Huge current-song title, key, tempo. Next song visible but secondary.
- Maximum contrast, no chrome, screen-wake kept on.
- Manual next/previous for anyone, regardless of sync.
- **AC:** legible from 1.5 metres on a phone in a dark room. Test physically, not in a simulator.

**E2 — Live setlist sync** ⭐ · `F105` · P1, P2

> As a band, we want the leader's position in the set to move everyone's screen, so nobody is lost when the set changes.

- Leader advances → all connected devices follow within ~2 seconds.
- Any member can **detach** to browse freely and **re-attach** to follow again. Detaching must be obvious and one tap — never trap someone.
- Graceful when a device drops: it keeps working alone and re-syncs on reconnect.
- **AC:** three devices, one leader; advancing propagates in ≤2s; killing the network on one device doesn't break the other two; reconnecting resyncs.

**E3 — Chart follows the set** · `F108` · P2

> As a member, I want the chart for the current song to be right there.

- One tap from performance mode to the current song's chart. If sync moves the song, the chart moves with it.
- **AC:** chart opens in ≤1 tap and stays in step with the live position.

### Epic F — Platform foundations

**F1 — It works with no signal** · `F602` · P2

> As a member at a venue with no signal, I want everything I need to already be on my device.

- All band data (repertoire, events, setlists, charts) is cached locally and readable offline.
- Charts are downloaded ahead of time, not streamed on demand.
- v0.1 scope: **offline read**. Offline write is v0.2 ([ADR-0003](../tech/adr/0003-offline-first-sync-strategy.md)).
- **AC:** airplane mode → open app → full repertoire, next event, setlist and charts all readable.

**F2 — Stage-dark by default** · `F604` · P2

- Dark theme is _the_ theme in v0.1. Designed for a dark room, contrast-checked.
- **AC:** WCAG AA contrast on all text.

**F3 — Nothing is gated, but everything is measured** · `F613` `F614` · —

- All access flows through `useEntitlement()`, returning `true` for everything in Phase 1.
- Per-user and per-band storage usage is recorded from the first upload.
- **AC:** no UI component reads a plan name directly; storage bytes are queryable per band.

---

## Non-functional requirements

| #   | Requirement          | Target                                          | Why                                             |
| --- | -------------------- | ----------------------------------------------- | ----------------------------------------------- |
| N1  | Cold start to usable | < 2s on mid-range Android                       | Sara opens it in a car park                     |
| N2  | Live sync latency    | < 2s across devices                             | Slower than a spoken "next one" is useless      |
| N3  | Offline read         | 100% of band data                               | Concrete walls                                  |
| N4  | Stage legibility     | Readable at 1.5m                                | Physically tested                               |
| N5  | Join flow            | < 30s, ≤ 4 taps                                 | The core differentiator, measured               |
| N6  | Chart open time      | < 1s from cache                                 | On stage, 3 seconds is forever                  |
| N7  | Data isolation       | A member of band A can never read band B's data | Enforced by RLS at the database, not the client |
| N8  | Crash-free sessions  | > 99%                                           | Live show = zero tolerance                      |

---

## Definition of done for v0.1

- [ ] All Epic A–F stories meet their acceptance criteria on **both** iOS and Android
- [ ] N1–N8 verified — N4 and N5 measured with a stopwatch and a real person, not estimated
- [ ] A real band with ≥4 members has run **one rehearsal and one gig** on it
- [ ] Zero data-loss incidents during that period
- [ ] Row-level security verified: a test account in band A cannot reach band B's rows or files
- [ ] Data export works ([R9](../business/06-risks-and-open-questions.md))
- [ ] Privacy policy and ToS published, DMCA contact live ([ADR-0007](../tech/adr/0007-copyright-user-generated-charts-only.md))
- [ ] Docs updated to match what was actually built

## What we learn from v0.1

v0.1 is an experiment, and these are its readings — feeding [14-validation-plan](14-validation-plan.md):

1. **Do passive members actually open it?** (% of non-leaders active weekly — answers [Q1](../business/06-risks-and-open-questions.md))
2. **Is live sync used or ignored?** (sync sessions per gig — answers Q2)
3. **Do people upload charts?** (charts per song — answers Q3)
4. **Does a band survive past week 4**, or drift back to WhatsApp?

If (1) is low, the wedge is wrong and the plan changes before v0.2 is built.

---

**Related:** [10 — Feature Inventory](10-feature-inventory.md) · [12 — Roadmap](12-roadmap.md) · [13 — Domain Model](13-domain-model.md) · [03 — Personas](../business/03-personas-and-jtbd.md) · [20 — Design Principles](../design/20-design-principles.md)
