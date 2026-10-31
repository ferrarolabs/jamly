# 14 — Validation Plan

> **Purpose:** find out whether the thesis is wrong _before_ spending a year building on it.
>
> Everything in [03-personas](../business/03-personas-and-jtbd.md) is currently a hypothesis derived from desk research. This document turns those hypotheses into questions for real musicians, and — critically — states in advance **what answer would make us change the plan**.

---

## The thesis, stated so it can be falsified

> **T1.** Bands manage their musical life with fragmented tools (chat + drive + memory) and this causes real, recurring friction they can name.
> **T2.** Existing band apps fail primarily because _the whole band won't adopt them_, not because they lack features.
> **T3.** A radically simpler, offline-capable, link-to-join app would get adopted by the whole band.
> **T4.** Connecting the band's setlist to the individual's practice is a compelling, differentiated benefit.
> **T5.** Musicians would eventually pay a modest individual subscription for the personal half.

**If T2 or T3 is false, the wedge is wrong and the product should be rethought.** T1 is nearly certain, T4 is the moat, T5 is the business.

---

## Method

**8–10 semi-structured interviews, 30 minutes each**, before starting v0.2 — and ideally before finishing v0.1.

**Who to recruit** (deliberately mixed, and deliberately including sceptics):

| Segment                                       | How many | Why                                                            |
| --------------------------------------------- | -------- | -------------------------------------------------------------- |
| Band leaders / organizers (P1)                | 3        | The buyer and champion                                         |
| **Passive members (P2) — drummers, bassists** | **3–4**  | **The most important segment. The whole thesis rests on them** |
| Solo/improving players (P3)                   | 2        | Validates the v0.2 personal layer                              |
| Someone who **tried** a band app and stopped  | 1–2      | The most informative interview of the set                      |

**Where to find them:** own network and own band first; local rehearsal rooms; music-school noticeboards; Italian and international musician forums and Discords. Not a survey — surveys give you what people think they should say.

**How to run it:**

- Ask about **what they did last week**, not what they would like. Past behaviour is evidence; stated preference is noise.
- Do not describe Jamly until the last five minutes. Describing the product first contaminates everything after it.
- **Never ask "would you use this?"** — everyone says yes to be polite. Ask what they do now, what it costs them, and what they've already tried and abandoned.
- Record (with permission) or take notes immediately after. Memory rewrites interviews into agreement.

---

## Interview script

### Part 1 — Context (5 min)

1. Tell me about the band(s) you play in. How often do you rehearse? How often do you play out?
2. What's your role — do you organize things, or does someone else?

### Part 2 — Current behaviour (12 min) — _the most valuable section_

3. Walk me through your last gig. **From the moment it got booked to the moment you got home.** Who told you about it? How did you know what to play? Where was the setlist? _(Let them talk. Don't interrupt. This single question tests T1.)_
4. Where does your band's setlist physically live right now? Can you show me?
5. When the set changes at the last minute, what happens?
6. Where are your charts and lyrics? What happens when you don't have them?
7. How does your band handle money from gigs? How do you know who's been paid?
8. What do you do between rehearsals to prepare? How do you decide what to practise?
9. **What's the most annoying part of being in your band that has nothing to do with music?** _(The single best question in this script.)_

### Part 3 — Tools tried (5 min) — _tests T2_

10. Have you or your band ever tried an app for this? Which one?
11. _(If yes)_ What happened? Are you still using it? **Did everyone in the band use it, or just one person?**
12. _(If they stopped)_ What made you stop? _Listen for: "nobody else used it"._
13. What would have to be true for your whole band to actually use something like that?

### Part 4 — Reaction (8 min) — _tests T3, T4, T5. Only now describe Jamly._

14. _Describe the wedge in two sentences._ What's your first reaction? What's missing?
15. _Describe live setlist sync._ Would that have helped at your last gig, honestly? _(Tests Q2)_
16. _Describe the practice connection:_ "the band adds 4 songs to Saturday's set, and your practice list updates automatically." _(Tests T4 — watch their face, not their words)_
17. Would your bandmates install this if you sent them a link? **Who in your band would definitely not?** _(The honest version of the adoption question)_
18. Do you pay for any music apps today? Which, and how much? _(Tests T5 — asks about real behaviour, not willingness)_

### Part 5 — Close (2 min)

19. What haven't I asked about that I should have?
20. Can I come back to you when there's something to try? Would your band be willing to test it at a rehearsal?

---

## What we're listening for

### Signals that support the thesis ✅

- They describe the WhatsApp/Drive/memory workflow **unprompted**, in Part 2
- Real stories of a set changing badly, a wrong chart, a forgotten date
- "We tried [app] but **only I ever used it**" — direct confirmation of T2
- Visible reaction to the practice connection (Q16) — leaning in, "oh, that's clever"
- They already pay for something (Modacity, UG Pro, forScore) — confirms T5 is possible
- They volunteer their band as testers before being asked

### Signals that falsify it ❌

- **"Honestly, the group chat works fine"** from several people → T1 weak, and the whole premise wobbles
- Passive members say plainly they will not install another app **for anything** → **T3 dead, wedge must be rethought**
- Live sync gets a shrug, "we just talk to each other" → Q2 answered negative, de-prioritize the flashiest feature
- "I'd never move my charts out of forScore" repeatedly → Q3 answered negative, drop chart display from v0.1 and become a pure logistics tool
- The practice connection gets a polite nod and nothing more → T4 weak, the moat needs rethinking
- Nobody pays for any music app → T5 doubtful, plan for permanently free

---

## Pre-committed decisions

Written **before** the data arrives, so the results can't be rationalized afterwards. This is the point of the whole document.

| If we hear…                              | From how many            | Then we…                                                                                    |
| ---------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| "Group chat is fine, no real pain"       | ≥ 5 of 10                | **Pause building.** Re-examine T1 before writing more code                                  |
| "Passive members won't install anything" | ≥ 3 of 4 passive members | **Wedge is wrong.** Pivot toward the solo/personal product (P3-first) instead of band-first |
| "Live sync is a gimmick"                 | ≥ 6 of 10                | Demote `F105` from v0.1 Must to v0.2 Should; rebuild v0.1 around repertoire + events        |
| "I keep my charts where they are"        | ≥ 6 of 10                | Cut chart display from v0.1; become logistics-only and interoperate instead                 |
| Practice connection excites people       | ≥ 6 of 10                | **Accelerate v0.2**, and lead all messaging with it                                         |
| Practice connection lands flat           | ≥ 6 of 10                | Re-examine the moat. Consider leading with gear (v0.4) instead                              |
| Nobody pays for music apps               | ≥ 8 of 10                | Drop Phase 2 planning; optimize purely for cost and learning                                |

---

## Product analytics as continuous validation

Interviews are a snapshot. Once v0.1 ships, behaviour answers the same questions better than words do. Minimal, privacy-respecting, no third-party ad SDKs ever.

**North-star metric: active bands.** A band with ≥60% of members active in the last 14 days. Never total users — a user count would hide exactly the failure mode we're most afraid of ([R2](../business/06-risks-and-open-questions.md)).

| Metric                                                       | Answers                            | Healthy       |
| ------------------------------------------------------------ | ---------------------------------- | ------------- |
| **Passive-member weekly activity** (% of non-leaders active) | **Q1 — the thesis**                | > 60%         |
| Invite → join conversion                                     | Is onboarding really frictionless? | > 70%         |
| Time from link tap to first useful screen                    | Story A3's core AC                 | < 30s         |
| Live sync sessions per gig                                   | Q2                                 | > 0.5         |
| Charts uploaded per song                                     | Q3                                 | > 0.3         |
| Band retention at week 4 / week 8                            | Is any of this sticky?             | > 50% / > 35% |
| Practice sessions logged per active user (v0.2)              | Q4                                 | > 2/week      |

---

## Beyond interviews

- **Forum and community listening** — read musician forums for the language people use about these problems. Adopt their words in the UI ([04-positioning](../business/04-positioning.md)).
- **Observe a real gig.** One evening watching a band load in, soundcheck and play, specifically noticing every moment someone looks for information, is worth several interviews.
- **Use it in the developer's own band first.** Dogfooding surfaces things no interview can — but it is not a substitute for strangers, because a band that knows the developer will forgive things strangers won't.

---

## Timing

| When                                  | What                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------- |
| **Now (during v0.0/v0.1 build)**      | 3–4 interviews. Cheap, and can still change v0.1                          |
| **Before v0.1 ships**                 | Remaining interviews to reach 8–10; apply the pre-committed decisions     |
| **After the first real gig on Jamly** | Debrief every member of that band separately                              |
| **Before starting v0.2**              | Review analytics against the decision gate in [12-roadmap](12-roadmap.md) |

Do not wait for a finished product to start talking to people. The interviews that change the plan are the ones that happen while the plan can still change.

---

**Related:** [03 — Personas & JTBD](../business/03-personas-and-jtbd.md) · [06 — Risks & Open Questions](../business/06-risks-and-open-questions.md) · [11 — MVP Scope](11-mvp-scope.md) · [12 — Roadmap](12-roadmap.md)
