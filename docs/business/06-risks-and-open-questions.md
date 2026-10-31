# 06 — Risks & Open Questions

> **Status:** Living document · Review at every milestone
> Ranked by expected damage × likelihood. R1 and R2 are the ones that actually kill this project; the rest are manageable.

---

## R1 — Scope collapse ⚠️ **highest risk**

**The risk:** Jamly's vision spans six products. A solo developer builds 40% of each, ships none, loses momentum, and the project dies half-finished. This is the single most common death of ambitious personal projects, and this project's own framing ("mastodontic application") names the danger out loud.

**Early warning signs:**

- A new feature starts being built before the current one is finished
- The word "quickly" appears before a feature that isn't in [11-mvp-scope](../product/11-mvp-scope.md)
- More than two features are in progress at once
- Weeks pass with no user-visible change

**Mitigation:**

1. [11-mvp-scope](../product/11-mvp-scope.md) is a contract. Anything outside it is not built, however small it looks.
2. Every new idea goes into [10-feature-inventory](../product/10-feature-inventory.md) _immediately and without argument_. The inventory is designed as a pressure valve: ideas are captured, not lost, and not built.
3. Milestones are defined by "a band could use this", not by feature count.
4. **Vision documents are allowed to stay huge.** That's their job. It's the sprint that stays small.

**Owner action:** re-read this section whenever a session begins with "wouldn't it be cool if".

---

## R2 — The multiplayer chicken-and-egg ⚠️ **highest risk**

**The risk:** Jamly's value requires the whole band. One member alone gets nothing. So the first experience of the very first user is an empty app with no bandmates — and there is no single-player fallback to keep them until the others arrive. This is exactly the failure that the incumbent's own users describe ([02-market](02-market-and-competitors.md)), and we have no reason to believe we're immune.

**Mitigation:**

1. **Invitation is the core feature, not a settings screen.** Link-based join, no account ceremony, working in under 30 seconds ([20-design-principles](../design/20-design-principles.md)).
2. **Solo value on day one.** Repertoire, personal charts and practice must be useful to one person alone, so the app survives the days between the leader joining and the band arriving.
3. **Design for Sara, not Marco.** The passive member is the primary persona ([03-personas](03-personas-and-jtbd.md)). Any feature that helps the leader but adds friction for the member is a net negative.
4. **Measure bands, not users.** The north-star metric is _active bands_ — a band with ≥60% of members active in the last 14 days. A vanity user count would hide this failure until it's fatal.
5. Recruit the first bands personally, including the developer's own. Do not launch cold.

---

## R3 — Copyright & licensing 🔴 **legal, non-negotiable**

**The risk:** distributing chord charts, tabs, lyrics or sheet music of copyrighted songs without a license is infringement, and the industry actively enforces it.

**Precedent, not speculation:**

- The On-line Guitar Archive received a takedown from lawyers for the NMPA and MPA and **removed all 34,000 tablatures** in 2006. ([source](https://en.wikipedia.org/wiki/On-line_Guitar_Archive))
- Sites showing chords and lyrics "either have a license to the lyrics or they are infringing."
- The NMPA has an **active, ongoing campaign against unlicensed apps** — the Vinkle lawsuit was announced as the start of it, with ~100 cease-and-desists sent to other apps. ([source](https://www.billboard.com/pro/nmpa-vinkle-full-lawsuit-ignoring-licenses))

**Mitigation — binding product rules ([ADR-0007](../tech/adr/0007-copyright-user-generated-charts-only.md)):**

1. **All charts, lyrics, scores and audio are user-uploaded and live only inside a private band space.** Private storage, row-level security, no public URLs.
2. **No public library. No cross-band sharing of charts. Ever.** Not a feature we haven't built yet — a feature we have decided never to build.
3. **No scraping or importing from third-party chord sites.**
4. Terms of Service place responsibility for uploaded content on the uploader; a DMCA/notice-and-takedown process and contact address exist from launch.
5. **Gear presets are the opposite case** — a drum tuning or an amp setting is not a copyrighted musical work — so that library _can_ be public and social. This is why Pillar 3 is the social pillar and Pillar 1 is not.

**Residual risk:** low, given private-only storage — this is functionally the same posture as a cloud drive. It becomes high the instant anyone proposes "let users share charts between bands". That proposal must be refused, and this document is the reason why.

---

## R4 — Solo developer burnout / bus factor

**The risk:** one person, a day job, and a project this size. Motivation is the actual bottleneck, not skill.

**Mitigation:**

1. Ship something visible on a regular cadence. Momentum is the fuel; documents alone don't provide it.
2. **Real users early.** Own band, friends' bands. Someone waiting for a feature is worth more than any discipline technique.
3. Milestones sized so each one is completable in a few weeks. Never a three-month invisible slog.
4. Keep the boring foundations (CI, types, conventions) in place — they cost little now and prevent the "I don't want to open this codebase" state that kills projects at month six.
5. Everything is documented _here_, so returning after a two-month gap costs an hour, not a week.

---

## R5 — Nobody adopts / the thesis is wrong

**The risk:** we build the wedge and bands shrug. Maybe the WhatsApp group is genuinely good enough. Maybe live setlist sync is a demo trick nobody needs.

**Mitigation:**

1. [14-validation-plan](../product/14-validation-plan.md): 8–10 real conversations _before_ over-building. The plan explicitly defines what would falsify the thesis.
2. v0.1 is deliberately small so being wrong costs weeks, not a year.
3. The fallback outcome is explicit and acceptable: [01-vision §7](01-vision.md) — the learning is real even if the business isn't.

---

## R6 — Incumbents close the gap

**The risk:** BandHelper or a funded newcomer adds practice tracking, or simplifies onboarding.

**Assessment: low urgency.** Simplification is culturally impossible for a product whose value proposition is completeness — removing options angers existing users. Adding a personal-practice layer means becoming a different kind of product. Both are slow, painful moves for an incumbent, and neither is a fast follow.

**Mitigation:** be genuinely good at the seam (band → personal) rather than at any single feature. Feature-for-feature we will always lose.

---

## R7 — Offline sync complexity

**The risk:** offline-first is a hard distributed-systems problem. Concurrent edits to the same setlist by two members on bad connections is the kind of bug that eats months.

**Mitigation:** scope the guarantee honestly rather than promising too much ([ADR-0003](../tech/adr/0003-offline-first-sync-strategy.md)). v0.1 promises **offline read of everything, offline write of personal data, last-write-wins on shared data with visible conflict indication.** Not CRDTs, not real collaborative editing. Bands do not simultaneously reorder the same setlist often; solving that at v0.1 would be over-engineering with a high failure cost.

---

## R8 — Platform & store risk

App Store review, Apple/Google policy changes, the €99/yr Apple developer fee, and — later — in-app purchase rules taking 15–30%.

**Mitigation:** the web build (free with the chosen stack) is a hedge that keeps a distribution channel outside the stores. No billing in Phase 1 means no store billing risk in Phase 1. Budget for the developer fee before launch, not at launch.

---

## R9 — Data loss / trust

A band's entire repertoire lives here. Losing it is unrecoverable reputationally in a community this small.

**Mitigation:** managed Postgres with automated backups; export functionality **free and available to everyone from v0.1** ([05-business-model](05-business-model.md)); no destructive operation without soft-delete; a documented restore procedure that is actually tested at least once.

---

## R10 — Name / trademark collision

Unresolved but cheap. Checks listed in [04-positioning](04-positioning.md). Must be closed before any public launch or paid marketing. Renaming pre-launch costs a day; post-launch it costs the brand.

---

## Open questions

Questions we cannot answer from the desk. Each one maps to the validation plan.

| #   | Question                                                                | How we'll answer it                      | Blocks                                        |
| --- | ----------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------- |
| Q1  | Will passive members use _any_ app, or only chat?                       | Interviews (P2 Sara)                     | The entire wedge                              |
| Q2  | Is live setlist sync valuable or a party trick?                         | Interviews + observe a real gig          | v0.1 priority order                           |
| Q3  | Will musicians move charts into Jamly, or keep forScore/OnSong forever? | Interviews                               | Whether we build chart display at all in v0.1 |
| Q4  | Does band→practice excite people?                                       | Interviews (P3 Luca)                     | v0.2 scope                                    |
| Q5  | Which half would anyone pay for?                                        | Interviews + Phase 2                     | Pricing                                       |
| Q6  | Is drum/non-guitar preset sharing a real desire?                        | Interviews (P4 Andrea) + forum listening | v0.4 scope                                    |
| Q7  | Do bands prefer one app, or best-of-breed per job?                      | Interviews                               | The all-in-one thesis itself                  |

**Q7 is the deepest one.** The whole premise is that fragmentation is the problem. If musicians actually _like_ using specialized tools and only want the logistics glue, then Jamly should be a smaller, sharper product than the vision describes — and that would be a valuable thing to learn early rather than late.

---

**Related:** [01 — Vision](01-vision.md) · [02 — Market](02-market-and-competitors.md) · [14 — Validation Plan](../product/14-validation-plan.md) · [ADR-0007](../tech/adr/0007-copyright-user-generated-charts-only.md)
