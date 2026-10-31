# 12 — Roadmap

> **Milestone-based, not date-based.** A solo developer with a day job cannot honestly predict dates, and fake dates only generate guilt. Each milestone is defined by _what a band can do_ when it's finished.
>
> **Every milestone ends with real users.** A milestone that ships to nobody hasn't shipped.

---

## The arc

```
 v0.0        v0.1            v0.2            v0.3           v0.4          v1.0
 FOUNDATION  THE BAND LOOP   THE PERSONAL    THE MONEY      THE GEAR      PUBLIC
 ──────────  ─────────────   LAYER           ───────        ─────         ──────
 docs +      rehearsal→gig   practice from   earnings &     presets for   polish,
 scaffold    live setlists   the setlist ⭐   payouts        everyone      launch
                                                            (incl. drums)
 ▲ you are here
```

The order is not arbitrary:

1. **The band loop first**, because Jamly is worthless to one person and the multiplayer problem is the riskiest thing to learn ([R2](../business/06-risks-and-open-questions.md)).
2. **The personal layer second**, because it's the moat — but it needs band data to feed on. Built first, it would be a worse Modacity.
3. **Money third**, because it's high value but zero-differentiation; competitors all have it and nobody chooses a tool for it.
4. **Gear fourth**, because it's the least contested opportunity but needs a community to share into.

---

## v0.0 — Foundation _(this milestone)_

**Goal:** the project exists, the thinking is written down, and the app runs on a phone.

- [x] Market and competitor research
- [x] Business case, personas, positioning, business model, risks
- [x] Feature inventory, MVP scope, domain model
- [x] Design principles + information architecture
- [x] Architecture, stack, data model, conventions, 7 ADRs
- [x] Git repo, Expo app skeleton, stage-dark theme, five-tab navigation, CI
- [x] v0.1 schema as a versioned migration with row-level security
- [ ] First validation interviews ([14-validation-plan](14-validation-plan.md)) — start now, they can still change v0.1

**Done when:** `npx expo start` opens the app on a real phone with the five main screens navigable, and every decision so far has a document behind it. ✅ _reached 2026-09-01_

---

## v0.1 — The band loop

**Goal:** a real band runs one rehearsal and one gig on Jamly, without the developer present.

Full scope in [11-mvp-scope](11-mvp-scope.md). In short: join by link → repertoire → setlists → live sync on stage → works offline.

**Done when:**

- All Epic A–F acceptance criteria pass on iOS and Android
- A band with ≥4 members has played a real gig on it
- Zero data loss, no critical crash during that gig

**What we learn:** do passive members open it (Q1), is live sync used (Q2), do people upload charts (Q3).

> **Decision gate.** If passive-member weekly activity is low after v0.1, **stop and rethink the wedge** rather than proceeding to v0.2. That number is the thesis.

---

## v0.2 — The personal layer ⭐

**Goal:** Jamly starts giving something back to the individual musician, and becomes worth keeping between gigs.

| Feature                                                     | ID                   |
| ----------------------------------------------------------- | -------------------- |
| Log a practice session                                      | `F401`               |
| Per-song confidence rating (surface what v0.1 modelled)     | `F402`               |
| **Practice list generated from the band's next setlist** ⭐ | `F403`               |
| Practice history & stats                                    | `F404`               |
| "Are we ready?" — band readiness vs. next gig               | `F405`               |
| Offline **writes** with sync on reconnect                   | `F603`               |
| Push notifications: new event, setlist changed              | `F212`               |
| Multi-band support                                          | `F216`               |
| Calendar export                                             | `F211`               |
| Tablet layouts                                              | `F606`               |
| Per-member charts                                           | `F112`               |
| Light theme, data export, accessibility pass                | `F605` `F609` `F612` |

**Done when:** a member can open Jamly on a Tuesday with no gig in sight and get something useful — the answer to "what should I practise?"

**What we learn:** does the band→practice connection actually land (Q4)? This is the moat; if it doesn't excite people, the differentiation story needs rewriting.

---

## v0.3 — The money

**Goal:** the band stops having awkward conversations about who's been paid.

| Feature                            | ID     |
| ---------------------------------- | ------ |
| Gig fee & earnings tracking        | `F207` |
| Payout tracking — who's been paid  | `F208` |
| Shared expenses and splitting      | `F209` |
| Performance history                | `F210` |
| ChordPro charts with transposition | `F111` |
| Setlist templates / duplicate      | `F116` |
| Export setlist to PDF              | `F117` |
| Web build                          | `F607` |
| Italian localization               | `F611` |

**Done when:** a band can answer "what did we earn this year and who still owes whom" without a spreadsheet.

> Not differentiating — every competitor has this. It's here because it's genuinely valuable to P1 Marco and it's the feature that makes a band commit for a whole season rather than a gig.

---

## v0.4 — The gear

**Goal:** open the least contested niche found in the research — and the first Jamly feature that can be genuinely public.

| Feature                                   | ID     |
| ----------------------------------------- | ------ |
| Gear profile / instrument list            | `F301` |
| Named setup presets per instrument        | `F302` |
| **Drum tuning presets** — the empty niche | `F303` |
| Pedalboard / amp chains                   | `F304` |
| Keys patches, bass rigs, IEM mixes        | `F305` |
| **Public preset sharing & browsing**      | `F306` |
| Attach a setup to a song or event         | `F307` |

**Done when:** a drummer can save the tuning that worked at a venue and find someone else's for a room like it.

> **This is the first public, social surface in Jamly** — and it is legally safe to be public precisely because a preset is not a copyrighted musical work, unlike a chart ([R3](../business/06-risks-and-open-questions.md)). It is also the first plausible organic-growth channel: preset pages are content that non-users can find.

---

## v1.0 — Public launch

**Goal:** Jamly is a product other people can find, trust and pay for.

- Polish, performance, empty states, error handling
- Onboarding refined against real drop-off data
- Landing page, App Store and Play Store listings
- Privacy policy, ToS, DMCA process finalized
- Trademark checks closed ([R10](../business/06-risks-and-open-questions.md))
- **Phase 2 monetization switch**: individual Pro, with the grandfathering rule enforced ([05](../business/05-business-model.md))
- Discovery pillar entry point: `F502` "where this song comes from" — attached to songs the band already plays, rather than an encyclopedia nobody opens

**Done when:** a band that has never met the developer finds Jamly, adopts it, and stays past 8 weeks.

---

## Beyond v1.0

Not planned — recorded so they aren't forgotten. Held in [10-feature-inventory](10-feature-inventory.md).

- The music wiki as a real content pillar (`F501`–`F504`) — expensive, editorial, unvalidated
- Desktop build (`F608`)
- Library import from OnSong / forScore (`F115`) — high value, high effort, unvalidated
- Stage plots and input lists (`F308`, `F309`)
- Music-school / teacher edition — a different product, deliberately deferred

---

## Principles for keeping this honest

1. **One milestone at a time.** No work starts on v0.2 while v0.1 is unfinished. ([R1](../business/06-risks-and-open-questions.md))
2. **Every milestone ships to real users.** No exceptions.
3. **Milestones can be cut, not extended.** If v0.2 is dragging, remove features — never move the goalposts and never start the next thing to escape a hard one.
4. **The decision gate after v0.1 is real.** Validation data is allowed to change this roadmap. A roadmap that survives contact with users unchanged means nobody looked at the data.
5. **New ideas do not enter a milestone in progress.** They go to the inventory. Always.

---

**Related:** [11 — MVP Scope](11-mvp-scope.md) · [10 — Feature Inventory](10-feature-inventory.md) · [14 — Validation Plan](14-validation-plan.md) · [05 — Business Model](../business/05-business-model.md)
