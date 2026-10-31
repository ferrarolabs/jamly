# 10 — Feature Inventory

> **This document is the pressure valve.** Scope collapse is the number one risk to this project ([R1](../business/06-risks-and-open-questions.md)). Every new idea gets written here **immediately**, and is then not built until it earns a place in [11-mvp-scope](11-mvp-scope.md) or [12-roadmap](12-roadmap.md).
>
> Adding a row here is free and always allowed. Building a row is not.

## How to use this

**New idea?** Add a row. Don't discuss it, don't estimate it, don't build it. Just capture it with an honest first guess at value and effort, and move on.

**Legend**

- **Value** — how much a target persona would care: `high` / `med` / `low`
- **Effort** — `S` (days) / `M` (1–2 weeks) / `L` (weeks) / `XL` (months, or needs research)
- **Conf.** — confidence that this is genuinely wanted: `high` / `med` / `low` (`low` = needs [validation](14-validation-plan.md))
- **MoSCoW** — Must / Should / Could / Won't _for the release named in Rel._
- **Rel.** — target release, or `?` if unassigned, or `—` for explicitly rejected

---

## Pillar 1 — Repertoire, charts & live sync

| #    | Feature                                                             | Persona | Value | Effort | Conf.   | MoSCoW    | Rel.  |
| ---- | ------------------------------------------------------------------- | ------- | ----- | ------ | ------- | --------- | ----- |
| F101 | Band repertoire: song list with title, artist, key, tempo, duration | P1      | high  | M      | high    | **Must**  | v0.1  |
| F102 | Song status (learning / rehearsing / gig-ready / retired)           | P1 P2   | high  | S      | high    | **Must**  | v0.1  |
| F103 | Setlist builder: drag-and-drop ordering, per-event                  | P1      | high  | M      | high    | **Must**  | v0.1  |
| F104 | Setlist sets/blocks with breaks, running total duration             | P1      | high  | S      | high    | **Must**  | v0.1  |
| F105 | **Live setlist sync** — leader advances, all devices follow         | P1 P2   | high  | L      | **med** | **Must**  | v0.1  |
| F106 | Performance mode: big stage-readable current-song view              | P2      | high  | M      | high    | **Must**  | v0.1  |
| F107 | Upload a chart/PDF/image to a song                                  | P1 P2   | high  | M      | high    | **Must**  | v0.1  |
| F108 | Chart viewer with zoom/scroll, follows live setlist                 | P2      | high  | M      | med     | Should    | v0.1  |
| F109 | Rehearsal reference audio per song                                  | P2      | med   | M      | med     | Should    | v0.2  |
| F110 | Personal notes per song (private to me)                             | P3      | high  | S      | high    | **Must**  | v0.1  |
| F111 | ChordPro text charts with transposition                             | P3      | med   | L      | med     | Could     | v0.3  |
| F112 | Per-member charts (the bassist sees the bass chart)                 | P2      | med   | M      | med     | Should    | v0.2  |
| F113 | Annotation on charts (pen/highlight)                                | P3      | med   | L      | low     | Could     | ?     |
| F114 | Auto-scroll / foot-pedal page turn                                  | P2      | med   | L      | low     | Could     | ?     |
| F115 | Import from OnSong / forScore / MobileSheets libraries              | P2      | high  | XL     | **low** | Could     | ?     |
| F116 | Setlist templates / duplicate a previous set                        | P1      | med   | S      | high    | Should    | v0.2  |
| F117 | Export setlist to printable PDF / share as image                    | P1      | med   | S      | high    | Should    | v0.2  |
| F118 | Song arrangement notes (structure, cues, endings)                   | P1 P2   | high  | S      | med     | Should    | v0.2  |
| F119 | Public chart library across bands                                   | —       | —     | —      | —       | **Won't** | **—** |

> **F119 is permanently rejected** on legal grounds, not product grounds. See [ADR-0007](../tech/adr/0007-copyright-user-generated-charts-only.md) and [R3](../business/06-risks-and-open-questions.md). If this idea resurfaces, the answer is still no.

## Pillar 2 — Band logistics & economy

| #    | Feature                                              | Persona | Value   | Effort | Conf.   | MoSCoW   | Rel. |
| ---- | ---------------------------------------------------- | ------- | ------- | ------ | ------- | -------- | ---- |
| F201 | Create a band, invite by link, join in <30s          | P1 P2   | high    | M      | high    | **Must** | v0.1 |
| F202 | Member roles (leader / member) and instruments       | P1      | high    | S      | high    | **Must** | v0.1 |
| F203 | Events: rehearsals and gigs with date, time, venue   | P1 P2   | high    | M      | high    | **Must** | v0.1 |
| F204 | "Next event" front and centre on the home screen     | P2      | high    | S      | high    | **Must** | v0.1 |
| F205 | Availability / RSVP per member per event             | P1      | high    | S      | high    | **Must** | v0.1 |
| F206 | Event details: load-in time, contact, address, notes | P1      | med     | S      | high    | Should   | v0.1 |
| F207 | Gig fee and earnings tracking                        | P1      | high    | M      | high    | **Must** | v0.3 |
| F208 | Payout tracking — who has been paid, who hasn't      | P1      | high    | M      | high    | **Must** | v0.3 |
| F209 | Shared expense tracking and splitting                | P1      | med     | L      | med     | Should   | v0.3 |
| F210 | Performance history: what we played, where, when     | P1      | med     | S      | med     | Should   | v0.3 |
| F211 | Calendar sync (Google/Apple Calendar export)         | P2      | high    | M      | med     | Should   | v0.2 |
| F212 | Push notifications for new events and setlists       | P2      | high    | M      | high    | Should   | v0.2 |
| F213 | Band chat / comments on events                       | P1 P2   | **low** | L      | **low** | Could    | ?    |
| F214 | Venue directory with history and contacts            | P1      | low     | M      | low     | Could    | ?    |
| F215 | Contracts / invoices / receipts for gigs             | P1      | med     | L      | low     | Could    | ?    |
| F216 | Multi-band support for one user                      | P3      | high    | M      | high    | Should   | v0.2 |
| F217 | Substitute/dep musician temporary access             | P1      | med     | M      | low     | Could    | ?    |

> **F213 (band chat) is a trap.** Jamly does not need to replace WhatsApp, and competing with a chat app the band already loves is unwinnable. Jamly wins by making the _structured_ things (dates, sets, money) not live in chat. Keep the chat; take the chaos.

## Pillar 3 — Gear & studio setup

| #    | Feature                                                            | Persona | Value | Effort | Conf.   | MoSCoW   | Rel. |
| ---- | ------------------------------------------------------------------ | ------- | ----- | ------ | ------- | -------- | ---- |
| F301 | Personal gear profile / instrument list                            | P4      | med   | S      | med     | Should   | v0.4 |
| F302 | Named setup presets per instrument (text + values + photos)        | P4      | high  | M      | med     | **Must** | v0.4 |
| F303 | **Drum tuning presets** — per drum, head, frequency/pitch          | P4      | high  | M      | **low** | **Must** | v0.4 |
| F304 | Pedalboard / amp chain documentation                               | P4      | high  | M      | med     | **Must** | v0.4 |
| F305 | Keys patch lists, bass rigs, IEM mixes                             | P4      | med   | M      | low     | Should   | v0.4 |
| F306 | **Public preset sharing & browsing** (legally safe, unlike charts) | P4      | high  | L      | low     | Should   | v0.4 |
| F307 | Attach a setup to a song or an event                               | P4      | med   | S      | med     | Could    | v0.4 |
| F308 | Stage plot builder                                                 | P1      | med   | L      | med     | Could    | ?    |
| F309 | Input list / patch sheet for the sound engineer                    | P1      | med   | M      | med     | Could    | ?    |
| F310 | Preset upvotes, comments, follows                                  | P4      | med   | L      | low     | Could    | ?    |
| F311 | Manufacturer preset file import/export (.qcp etc.)                 | P4      | low   | XL     | low     | Won't    | —    |

## Pillar 4 — Practice & progress

| #    | Feature                                                     | Persona | Value | Effort | Conf.   | MoSCoW   | Rel. |
| ---- | ----------------------------------------------------------- | ------- | ----- | ------ | ------- | -------- | ---- |
| F401 | Log a practice session (song, duration, notes)              | P3      | high  | S      | high    | **Must** | v0.2 |
| F402 | Per-song confidence rating, set by me                       | P3      | high  | S      | high    | **Must** | v0.2 |
| F403 | **Practice list generated from the band's next setlist** ⭐ | P3      | high  | M      | **med** | **Must** | v0.2 |
| F404 | Practice history & stats over time                          | P3      | high  | M      | high    | Should   | v0.2 |
| F405 | "Are we ready?" — band readiness view vs. next gig          | P1 P3   | high  | M      | med     | Should   | v0.2 |
| F406 | Practice goals and streaks                                  | P3      | med   | S      | med     | Could    | v0.3 |
| F407 | Skill/technique tracking beyond songs                       | P3      | med   | M      | low     | Could    | ?    |
| F408 | Built-in metronome                                          | P3      | low   | S      | med     | Could    | ?    |
| F409 | Built-in tuner                                              | P3      | low   | M      | low     | Could    | ?    |
| F410 | Practice session recording (audio)                          | P3      | med   | L      | low     | Could    | ?    |
| F411 | Practice reminders / notifications                          | P3      | med   | S      | med     | Could    | v0.3 |

> **F403 is the differentiating feature of the entire product.** Nothing else in this inventory is unavailable to a competitor. See [02-market §Gap 2](../business/02-market-and-competitors.md).

## Pillar 5 — Discovery & culture

| #    | Feature                                                     | Persona | Value | Effort | Conf.   | MoSCoW | Rel.  |
| ---- | ----------------------------------------------------------- | ------- | ----- | ------ | ------- | ------ | ----- |
| F501 | Music wiki: history, genres, artists                        | P3      | med   | XL     | **low** | Could  | v1.0+ |
| F502 | "Where this song comes from" context on repertoire songs    | P3      | high  | L      | low     | Could  | v1.0+ |
| F503 | Genre/lineage exploration                                   | P3      | med   | XL     | low     | Could  | ?     |
| F504 | Educational articles / lessons                              | P3      | med   | XL     | low     | Could  | ?     |
| F505 | Song suggestions for the band's repertoire                  | P1      | med   | L      | low     | Could  | ?     |
| F506 | Integration with music metadata APIs (MusicBrainz, Discogs) | P3      | med   | M      | med     | Could  | v1.0+ |

> Pillar 5 is the least validated and most expensive pillar in the product. It is content, not software — its real cost is editorial, not engineering. **F502 is the smart entry point**: attach context to songs the band already plays rather than building an encyclopedia nobody opens.

## Cross-cutting / platform

| #    | Feature                                                    | Value | Effort | Conf. | MoSCoW   | Rel.  |
| ---- | ---------------------------------------------------------- | ----- | ------ | ----- | -------- | ----- |
| F601 | Auth: email + password sign-in                             | high  | S      | high  | **Must** | v0.1  |
| F606 | Auth: password reset                                       | high  | S      | high  | **Must** | v0.1  |
| F607 | Auth: email OTP (six-digit code)                           | med   | M      | high  | Should   | v0.2  |
| F602 | Offline read of all band data                              | high  | L      | high  | **Must** | v0.1  |
| F603 | Offline write with sync on reconnect                       | high  | L      | high  | Should   | v0.2  |
| F604 | Dark stage-readable theme                                  | high  | S      | high  | **Must** | v0.1  |
| F605 | Light theme                                                | med   | S      | med   | Should   | v0.2  |
| F606 | Tablet-optimized layouts                                   | high  | M      | high  | Should   | v0.2  |
| F607 | Web build                                                  | med   | S      | med   | Could    | v0.3  |
| F608 | Desktop build                                              | low   | M      | low   | Could    | v1.0+ |
| F609 | **Full data export** (permanently free for everyone)       | high  | M      | high  | Should   | v0.2  |
| F610 | Social login (Google/Apple)                                | med   | M      | med   | Should   | v0.2  |
| F611 | i18n — English + Italian                                   | med   | M      | med   | Could    | v0.3  |
| F612 | Accessibility pass (screen reader, contrast, font scaling) | high  | M      | high  | Should   | v0.2  |
| F613 | Entitlement abstraction for future Pro                     | high  | S      | high  | **Must** | v0.1  |
| F614 | Usage/storage measurement per user & band                  | med   | S      | high  | **Must** | v0.1  |
| F615 | Analytics — minimal, privacy-respecting                    | med   | M      | med   | Should   | v0.2  |
| F616 | Crash reporting                                            | med   | S      | high  | Should   | v0.2  |

> **F613 and F614 are v0.1 Musts despite the product being free.** They cost almost nothing now and make the Phase 2 switch a configuration change instead of a refactor. See [05-business-model](../business/05-business-model.md).

---

## Parking lot — captured, unassessed

New ideas land here first. Assess them later, in batch, not in the moment.

| Idea                                                     | Noted      |
| -------------------------------------------------------- | ---------- |
| Rehearsal room booking / finding                         | 2026-09-01 |
| Setlist suggestions based on gig length and energy curve | 2026-09-01 |
| Merch and inventory tracking                             | 2026-09-01 |
| Guest musician / dep marketplace                         | 2026-09-01 |
| Integration with Spotify for reference tracks            | 2026-09-01 |
| Band public page / EPK                                   | 2026-09-01 |
| Rehearsal recording with automatic song splitting        | 2026-09-01 |
| Setlist analytics — which songs get played most          | 2026-09-01 |

---

## Summary

| Release            | Musts | Total features |
| ------------------ | ----- | -------------- |
| v0.1               | 16    | 18             |
| v0.2               | 3     | 16             |
| v0.3               | 2     | 8              |
| v0.4               | 3     | 7              |
| v1.0+ / unassigned | —     | ~25            |
| Rejected           | —     | 2              |

**~76 features identified. 18 in v0.1.** That ratio is the plan working as intended.

---

**Related:** [11 — MVP Scope](11-mvp-scope.md) · [12 — Roadmap](12-roadmap.md) · [R1 Scope collapse](../business/06-risks-and-open-questions.md)
