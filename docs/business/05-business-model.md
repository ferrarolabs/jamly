# 05 — Business Model

> **Status:** Decided for now, revisit at ~500 active users or when infra cost exceeds €20/month
> **Related ADR:** [0005 — Monetization: free now, Pro later](../tech/adr/0005-monetization-free-now-pro-later.md)

---

## The decision

**Phase 1 (now → v1.0): completely free. No limits, no paywalls, no ads, no trial timers.**

**Phase 2 (later, when the product deserves it): individual Pro subscription.** Each musician pays for their own Pro. Not per band, not per seat.

The switch must cost zero rewrite. That is an architecture requirement, not a business one — see [Building for the switch](#building-for-the-switch).

## Why free first

1. **Nothing is worth paying for yet.** Charging for an unvalidated product is the fastest way to learn nothing, because the only signal you get is "no".
2. **The product is multiplayer.** Jamly is worthless until a whole band is in it. Any friction — including a price — multiplies by five when you need five people to say yes. Free removes the argument the band leader would otherwise have to win five times.
3. **Usage is the currency right now.** The stated primary success criterion is learning and a real shipped product ([01-vision §7](01-vision.md)). Users generate the feedback that makes that real.
4. **Infrastructure is genuinely near-zero at this scale.** See [cost model](#cost-model).

## Why individual, not per-band

Rejected: per-band subscription (BandHelper's model, ~$8/mo for 2–5 members).

|                    | Per-band                                                    | **Individual (chosen)**                                                              |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Who decides        | One person must convince the band to spend shared money     | Each person decides for themselves                                                   |
| Failure mode       | One holdout blocks the whole band                           | A non-payer keeps using the free tier; band still works                              |
| Follows the user   | No — leave the band, lose access                            | **Yes — Pro follows the person across bands and instruments**                        |
| Fits our roadmap   | Fits band features only                                     | Fits the personal layer (practice, gear, discovery) which is where v0.2+ value lives |
| Billing complexity | Group ownership, proration, member changes — genuinely hard | Simple: one account, one subscription                                                |

The deciding argument: **Pro features will mostly be personal features.** Practice analytics, unlimited storage, personal chart tools, gear libraries — these are things one musician values for themselves. Charging the band for them would be incoherent.

**Hard rule:** _shared_ band functionality must never be gated. If Marco pays and Sara doesn't, the band must still work perfectly for both. The moment a paywall breaks the group, we've reintroduced the adoption problem we exist to solve.

---

## What becomes Pro (draft — subject to change before Phase 2)

The test for each: _does gating this hurt anyone other than the person choosing not to pay?_ If yes, it stays free forever.

### Always free, permanently

- Creating and joining bands, unlimited members
- Repertoire, setlists, events, live setlist sync
- Rehearsal/gig scheduling and availability
- Basic practice logging
- A generous storage allowance for charts and audio
- **Full data export** — always, for everyone, no exceptions

### Candidate Pro features

| Feature                                                          | Why it's fair to charge                                                                 |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Practice analytics & long history                                | Personal value, compounds over time, costs storage. Modacity charges $12.99/mo for less |
| Large file storage above the free allowance                      | Real marginal cost per user                                                             |
| Advanced chart tools (transposition, annotation, custom layouts) | Real development effort, purely personal benefit                                        |
| Multiple bands beyond a small number                             | Correlates with professional use and willingness to pay                                 |
| Full gear preset library, private preset collections             | Personal                                                                                |
| Export to PDF / print-ready set sheets                           | Convenience, no one else is blocked                                                     |
| Priority/beta access, supporter badge                            | Costs nothing, some people just want to support it                                      |

### Never

- Ads of any kind
- Selling or brokering user data
- Locking a user's own data behind a payment
- Anything that degrades the experience of a free member _inside a band that has paying members_

---

## Price anchors from research

| Product                      | Price                  | Note                                                |
| ---------------------------- | ---------------------- | --------------------------------------------------- |
| Modacity (personal practice) | **$12.99/mo, $129/yr** | Proves the ceiling for a purely personal music tool |
| BandHelper Pro (2–5 band)    | **$8/mo, $80/yr**      | Per band — ~$1.60–4/mo per person                   |
| Ultimate Guitar Pro          | **~$3–10/mo**          | Mass-market floor                                   |
| forScore, OnSong             | one-time purchase      | The habit of paying once, which subscriptions fight |

**Working hypothesis for Phase 2:** €3.99–4.99/month, €39–45/year. Below the Modacity anchor, above the Ultimate Guitar floor, and roughly what one person's share of a BandHelper subscription costs — so it reads as fair to anyone who has compared. `ASSUMPTION:` to be tested in the validation interviews, not guessed at launch.

A **lifetime/founder tier** during Phase 1→2 transition is worth considering: musicians demonstrably like one-time purchases, and early supporters of a free product deserve a way to stay whole.

---

## The migration rule (non-negotiable)

When Phase 2 arrives:

> **Nothing a user already has becomes paid.**

Anyone who used Jamly for free during Phase 1 keeps everything they were using, forever. Pro is built from **new** capability, not from fencing off what was given away. Users who joined before the switch get a permanent grandfathered status.

Breaking this rule is the single fastest way to destroy trust in a community as small and as talkative as gigging musicians. It must be technically enforceable — hence the `plan_grandfathered_at` field in the [data model](../tech/32-data-model.md).

---

## Cost model

What one active user actually costs to serve, so pricing is grounded rather than invented.

| Resource          | Driver                                                          | Estimate                  |
| ----------------- | --------------------------------------------------------------- | ------------------------- |
| Postgres rows     | Songs, setlists, events, practice logs — all small text records | Negligible                |
| File storage      | The real cost: PDFs (~1MB), rehearsal audio (~5–50MB)           | **The dominant variable** |
| Realtime messages | Only during rehearsals/shows, a few messages per song change    | Negligible                |
| Bandwidth         | Chart downloads, audio streaming                                | Moderate, follows storage |
| Auth / MAU        | Free at our scale on the chosen backend                         | €0                        |

**Practical conclusion:** Jamly's marginal cost is essentially _file storage and egress_. Text data is free. This is why the free tier is generous on features and bounded on storage — the gating dimension should match the cost dimension.

**Phase 1 budget:** free tier of the backend platform, target €0/month, hard ceiling €20/month before the model is revisited. Storage limits per band exist from day one as a **cost guard**, set high enough that no honest user hits them.

---

## Building for the switch

Requirements on the codebase so Phase 2 is a configuration change, not a refactor:

1. A `subscription` concept exists in the data model from v0.1 — every user has a plan, and in Phase 1 every plan is `free_unlimited`.
2. All feature access goes through a single `useEntitlement(feature)` abstraction. In Phase 1 it returns `true` for everything. Nothing in the UI checks a plan name directly.
3. Storage usage is **measured and recorded per user and per band from day one**, even while unlimited. You cannot price what you never measured.
4. `plan_grandfathered_at` is stamped on every account at creation, enabling the migration rule to be enforced in code.
5. No payment SDK, no store billing, no Stripe in Phase 1. Adding it later is a contained piece of work; carrying it early is dead weight and app-store risk.

---

## Non-goals

- **VC funding.** This is a personal project. Its viability bar is "covers its costs and is worth the time", not "returns 10x".
- **B2B/music school sales.** A real opportunity ([03 anti-personas](03-personas-and-jtbd.md)), deliberately deferred — a different product with a different sales motion.
- **Marketplace / transaction fees.** Booking, gear sales, session-musician matching. Out of scope entirely.

---

**Related:** [01 — Vision](01-vision.md) · [02 — Market & Competitors](02-market-and-competitors.md) · [ADR-0005](../tech/adr/0005-monetization-free-now-pro-later.md) · [32 — Data Model](../tech/32-data-model.md)
