# 04 — Positioning

> **Status:** Draft v1 · Refine after the first validation interviews ([14](../product/14-validation-plan.md))

---

## The positioning statement

> **For bands that rehearse and gig regularly** — and for the musicians in them —
> **Jamly** is the shared brain for the band and the private coach for your playing.
> **Unlike** band-management tools that only the band leader ever learns to use,
> **Jamly** is built so the drummer joins from a link in thirty seconds, and so everything the band agrees on flows straight into what you personally need to practice.

## The one-liner

**Jamly — everything your band agreed on, on everyone's screen. Even the drummer's.**

Alternates to test:

- _The band app your bandmates will actually open._
- _One place for your band. One place for your playing._
- _From the rehearsal room to the stage to your practice at home._

## Elevator pitch (30 seconds)

"Every band I know runs on a WhatsApp group, a Drive folder and someone's memory. There are apps that fix this, but they're so complicated that only the band leader ends up using them — and a tool for a group that one person uses is worthless. Jamly does the same job with a rule: any member has to be useful within thirty seconds of tapping a link. Setlists sync live during the show, it works with no signal at the venue, and then it does something nobody else does — the band's next setlist becomes your personal practice list."

---

## The three things we claim

Everything Jamly says in public reduces to these. If a message doesn't ladder up to one of them, cut it.

### 1. The whole band actually uses it

The differentiator is adoption, not features. The incumbent's own users report they can't get their bandmates on board ([02](02-market-and-competitors.md)). We treat the passive member as the primary user.
**Proof points:** join by link, no configuration, useful first screen, ≤30 second onboarding.

### 2. It works where music happens

Rehearsal rooms and venues have concrete walls and no signal. Offline-first from day one, not bolted on.
**Proof points:** full read/write offline, live sync when connected, stage-readable dark UI.

### 3. Your band makes you better

The claim nobody else can make, because nobody else holds both halves of the data.
**Proof points:** setlist-derived practice list, per-song confidence, personal layer on shared songs.

---

## The hard questions, answered

**"Why not just BandHelper? It does more."**
It does, and if your band has already learned it, stay. It's also described by its own users as having a steep learning curve that makes it hard to get every member on board, and sharing a set is a nine-step Dropbox process. Jamly does less on purpose, so that the whole band is actually in it — and then adds the thing BandHelper doesn't have at all: your personal practice.

**"Why not just WhatsApp and Google Drive?"**
Because a chat message scrolls away and a Drive folder doesn't know which chart is the current one. Jamly costs nothing to try and takes thirty seconds. If it doesn't beat the group chat in week one, don't keep it.

**"I already use forScore / OnSong for my charts."**
Keep it. We're not asking you to rebuild a 500-PDF library. Jamly is where the band agrees what's being played and when; bring the charts you want into the songs that matter.

**"Isn't this just another app that'll die?"**
Possibly — it's a personal project built in the open. That's why it's free with no limits and why your data is exportable. The honest version of this answer is better than a fake one.

**"Is my band's music/data private?"**
Yes, by design and by legal necessity. Charts and files live only inside your band's private space; there is no public library ([ADR-0007](../tech/adr/0007-copyright-user-generated-charts-only.md)).

---

## Voice & tone

Jamly talks like a bandmate who happens to be organized — not like software.

| Do                                                    | Don't                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------- |
| "Saturday, 21:00, Blue Note. You're in."              | "Event successfully created."                                 |
| "4 songs you haven't touched in a while."             | "Optimize your practice efficiency!"                          |
| Plain, short, slightly warm                           | Corporate, exclamation marks, "seamless", "revolutionize"     |
| Musician's vocabulary: set, chart, rehearsal, load-in | Generic productivity vocabulary: task, item, entity, resource |

The vocabulary rule is enforced technically: the [domain model](../product/13-domain-model.md) uses musicians' words as its type names, so the code and the UI can't drift apart.

---

## The name

**Jamly** — "jam" + a light suffix. Short, pronounceable in Italian and English, obviously music-adjacent, works as a verb-ish brand.

**Trademark status: unresolved, non-blocking.** A search found a `Jamly Technological Inspirations` entry on Crunchbase in an unrelated category, and no music app of that name in the stores. Before any public launch or paid marketing:

- [ ] Search EUIPO (primary jurisdiction) and USPTO for classes 9 (software) and 42 (SaaS)
- [ ] Check App Store / Google Play for name collisions
- [ ] Check `jamly.app` / `jamly.io` / `getjamly.com` availability
- [ ] Check the social handles

Cheap to fix now, expensive after launch. Tracked in [06-risks](06-risks-and-open-questions.md).

---

## Brand direction (early, not binding)

- **Dark-first.** Because the product lives on a stage, not because it's fashionable. The light theme is the secondary case.
- **One accent colour** used for "now" — the current song, the next event. Everything live is that colour and nothing else is.
- **Typography that reads at arm's length**, tested from a music-stand distance rather than in a design tool.
- **No stock photos of smiling people with guitars.** Screenshots of the thing working on a real stage.

Full rules in [20-design-principles](../design/20-design-principles.md).

---

**Related:** [01 — Vision](01-vision.md) · [02 — Market & Competitors](02-market-and-competitors.md) · [03 — Personas](03-personas-and-jtbd.md) · [05 — Business Model](05-business-model.md)
