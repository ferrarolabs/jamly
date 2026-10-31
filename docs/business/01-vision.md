# 01 — Vision

> **Status:** Living document · **Owner:** Eli Ferraro · **Last reviewed:** 2026-09-01

This is the north star. It is deliberately larger than anything we will build this year. Its job is to make sure every small decision points in a consistent direction — not to be a backlog. The backlog lives in [10-feature-inventory](../product/10-feature-inventory.md).

---

## 1. The problem

A musician's life is scattered across tools that were never designed for it.

The setlist is a photo in a WhatsApp group. The chord chart is a PDF in someone's Google Drive, and the version the singer is holding is not the one the guitarist printed. The rehearsal date is in a chat message that scrolled away three days ago. The gig fee is a number somebody remembers, and whether the drummer has been paid is a question asked out loud at the next rehearsal. The tone that took four hours to dial in exists only on one person's pedalboard. The practice you did this month is a feeling, not a fact.

None of these problems is dramatic. Together they produce a constant, low-grade tax on making music — time spent on logistics is time not spent playing. And critically, **every one of these fragments is a shared artifact being managed with a personal tool.**

The tools that do exist have not solved it. They have either:

- solved _one_ fragment well and ignored the rest (chart readers, practice loggers, preset clouds), or
- tried to solve all of them and produced software so complex that **the band won't adopt it** — which is the same as not solving it, because these problems are only solved when _everyone_ is in.

That second failure is the important one, and it is documented, not assumed. See [02-market-and-competitors](02-market-and-competitors.md).

## 2. The idea

**Jamly is an all-in-one digital hub for a musician's entire musical life** — bridging creative workflow, band logistics, and lifelong musical development — that scales from a bedroom player to a working professional.

Two halves that feed each other:

- **Band-Jamly** — the shared brain. Everything the band agreed on: repertoire, arrangements, setlists, dates, money, gear. One source of truth, live on everyone's device.
- **Me-Jamly** — the private coach. My charts, my notes, my practice, my progress, my gear, my musical curiosity.

The connection between them is the whole point. Your band's next setlist _is_ your practice list. Your practice history _is_ the answer to "are we ready for Saturday?". No other product in this space connects those two things.

## 3. Why now

- **Cross-platform development is finally cheap.** One TypeScript codebase now reaches iOS, Android, tablet and web credibly. A solo developer can build what needed a team five years ago.
- **Tablets are already on stage.** Musicians have normalized reading from a screen at gigs; the behavior change is done, and it happened without us.
- **Realtime and offline sync are commodity infrastructure.** Live setlist sync across a band's devices used to be a hard systems problem. It is now a managed service away.
- **The incumbents are structurally stuck.** The feature leader is a decade-old, configuration-heavy product with an acknowledged learning curve. The newcomers are thin. Nobody occupies the middle: complete _and_ effortless.
- **The market is real and hobbyist-funded.** Self-funded amateurs make up the majority of spending in adjacent music-learning markets. This is not an enterprise sale.

## 4. The full ecosystem (the north star)

Every pillar below is part of the long-term vision. Only the first is being built now.

### Pillar 1 — Cloud repository & live sync _(the wedge — building now)_

A persistent, offline-capable archive of the band's musical life: repertoire with arrangements, keys, tempos and durations; charts, lyrics and sheet music that members upload; rehearsal reference tracks; and setlists built for specific events. During a rehearsal or a show, the setlist is **live-synced** — the leader advances the song and every member's screen follows.

### Pillar 2 — Band logistics & economy

Shared calendar of rehearsals and gigs with availability, so "who can make Thursday" is answered once. Gig records with venue, fee, and load-in. Earnings tracking per member. Split payments and expense tracking that answers "who has already been paid" without anyone asking.

### Pillar 3 — Gear & studio setup

A place for the technical knowledge that currently lives in one person's head: drum tuning frequencies per drum and per head, pedalboard and amp chains, keys patches, bass rigs, IEM and monitor mixes, stage plots and input lists. Savable, shareable, downloadable. **Deliberately instrument-agnostic** — existing preset clouds are guitar-only and locked to one manufacturer.

### Pillar 4 — Training & practice tracking

Log practice sessions, per song and per skill. See real progress over time instead of guessing. Personal goals, streaks, and — the part nobody else can do — practice items generated directly from what the band actually needs next week.

### Pillar 5 — Musical discovery & culture

An integrated musical wiki to widen horizons: music history, genre lineages, artist deep-dives, "if you like this, understand where it came from". Educational content that turns Jamly from a utility into something you open when you're not working.

### Pillar 6 — The connective layer

Not a feature, an architecture. The song is one object with a band-shared face and a personal face. Every pillar hangs off that spine, which is why they compose instead of colliding.

## 5. What Jamly is not

Naming the non-goals is what keeps the vision from becoming infinite.

- **Not a DAW or recording studio.** BandLab has 100M users doing that. Jamly stores rehearsal reference audio; it does not produce music.
- **Not a notation editor.** Writing engraved sheet music is MuseScore's job.
- **Not a public tab/chord library.** This is a legal position, not a product preference — see [ADR-0007](../tech/adr/0007-copyright-user-generated-charts-only.md). Ultimate Guitar owns that space and carries the licensing burden that comes with it.
- **Not a social network for musicians.** Not a booking marketplace. Not a streaming service. Not a musician-finding app.
- **Not a metronome/tuner company.** We may include them as conveniences; they are not why anyone comes.

## 6. Three-year picture

**Year 1 — Earn the band.** A band adopts Jamly for rehearsals and gigs because it takes 30 seconds to join and works without signal at the venue. Success is measured in whole bands, not users: a band where 4 of 5 members opened the app this week.

**Year 2 — Earn the musician.** The personal layer becomes the reason individuals stay when they change bands or play alone. Practice tracking, personal charts and gear presets make Jamly follow the _person_, not the group. This is where an individual Pro subscription becomes fair to charge for.

**Year 3 — Earn the culture.** Discovery and educational content make Jamly something musicians open daily rather than weekly, and the gear-preset library — especially for drummers and non-guitarists, who have nothing today — becomes a body of knowledge that exists nowhere else.

## 7. What success means for this project

Two definitions, both valid, in priority order:

1. **As a learning vehicle (guaranteed):** a real, shipped, cross-platform product with a real backend, real users, real data model, real CI. Frontend depth first, genuine fullstack second. This outcome is under our control and is achieved even if nobody pays.
2. **As a business (aspirational):** enough individual Pro subscribers to cover infrastructure, then to be worth the time. The architecture must make this switch possible without a rewrite ([05-business-model](05-business-model.md)), but the product is not compromised to chase it early.

The order matters. Optimizing for revenue on day one would produce a worse product and a worse education.

---

**Related:** [02 — Market & Competitors](02-market-and-competitors.md) · [04 — Positioning](04-positioning.md) · [11 — MVP Scope](../product/11-mvp-scope.md) · [06 — Risks](06-risks-and-open-questions.md)
