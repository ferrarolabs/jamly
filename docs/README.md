# Jamly — Documentation

This folder is the project's memory. Code says _what_ Jamly does; these documents say _why_.

Everything here is versioned in git alongside the app. If a decision changes, the document changes with it — a stale document is worse than no document.

## How to read this

**New to the project?** Read in this order: [Vision](business/01-vision.md) → [Positioning](business/04-positioning.md) → [MVP Scope](product/11-mvp-scope.md) → [Architecture](tech/30-architecture.md).

**About to build something?** Check [MVP Scope](product/11-mvp-scope.md) and [Design Principles](design/20-design-principles.md) first.

**Have a new feature idea?** Do not start building it. Put it in the [Feature Inventory](product/10-feature-inventory.md).

---

## Business — why this exists and how it could sustain itself

| Document                                                               | Purpose                                                                                                |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [01 — Vision](business/01-vision.md)                                   | The full, unabridged north star. The complete ecosystem, deliberately larger than what we build first. |
| [02 — Market & Competitors](business/02-market-and-competitors.md)     | Who else is in this space, what they charge, where they fail, and the gaps we can own. Sourced.        |
| [03 — Personas & Jobs-To-Be-Done](business/03-personas-and-jtbd.md)    | Who we build for, what they are actually trying to get done, and what they use today.                  |
| [04 — Positioning](business/04-positioning.md)                         | The one-sentence answer to "what is Jamly and why not just use BandHelper?"                            |
| [05 — Business Model](business/05-business-model.md)                   | Free now, individual Pro later. What becomes paid, what never does, and what it costs to run.          |
| [06 — Risks & Open Questions](business/06-risks-and-open-questions.md) | Ranked list of what can kill this project, and the mitigation for each.                                |

## Product — what we build, in what order

| Document                                                  | Purpose                                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [10 — Feature Inventory](product/10-feature-inventory.md) | Every feature ever proposed, scored and triaged. The parking lot for new ideas. |
| [11 — MVP Scope](product/11-mvp-scope.md)                 | The definition of v0.1 done, as user stories with acceptance criteria.          |
| [12 — Roadmap](product/12-roadmap.md)                     | Milestone-based release plan from v0.1 to v1.0.                                 |
| [13 — Domain Model](product/13-domain-model.md)           | The ubiquitous language. Every noun in Jamly, defined once.                     |
| [14 — Validation Plan](product/14-validation-plan.md)     | How we test the thesis against real musicians before over-building.             |

## Design — how it should feel

| Document                                                               | Purpose                                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [20 — Design Principles](design/20-design-principles.md)               | The non-negotiable rules, most of them reactions to how competitors fail. |
| [21 — Information Architecture](design/21-information-architecture.md) | Navigation map and screen inventory.                                      |

## Tech — how it is built

| Document                                     | Purpose                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| [30 — Architecture](tech/30-architecture.md) | System diagram, client/server split, offline & sync strategy, auth.            |
| [31 — Stack](tech/31-stack.md)               | Every dependency and the reason it is there.                                   |
| [32 — Data Model](tech/32-data-model.md)     | Concrete schema, relations, and row-level security rules.                      |
| [33 — Conventions](tech/33-conventions.md)   | Folder structure, naming, git and code conventions.                            |
| [ADRs](tech/adr/README.md)                   | Architecture Decision Records — the permanent ledger of significant decisions. |

## Process — how we work

| Document                                              | Purpose                                                                                |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [40 — Ways of Working](process/40-ways-of-working.md) | Solo-dev cadence, definition of done, how docs stay honest.                            |
| [41 — Decision Log](process/41-decision-log.md)       | Chronological log of smaller decisions that don't warrant an ADR.                      |
| [42 — Project Board](process/42-project-board.md)     | Labels, milestones and the GitHub Project: what needs Elia, what an agent can pick up. |

## Learn — what each feature taught

One note per feature PR, for Elia: how it is built, the concepts behind it, the alternatives rejected.

- [A4 — What I play in this band](learn/a4-instruments.md)

---

## Rules for these documents

1. **A decision without a written reason is not a decision.** Significant technical choices become an [ADR](tech/adr/README.md). Everything else goes in the [Decision Log](process/41-decision-log.md).
2. **Claims about the market carry a source link.** No "I think musicians want" without evidence or an explicit `ASSUMPTION:` tag.
3. **The Feature Inventory absorbs new ideas.** Scope creep is the number one risk to this project ([see 06](business/06-risks-and-open-questions.md)); the inventory is the pressure valve that keeps ideas without letting them into the sprint.
4. **Vision is allowed to be huge. Scope is not.** [01-vision](business/01-vision.md) describes the whole ecosystem on purpose. [11-mvp-scope](product/11-mvp-scope.md) is deliberately, uncomfortably small.
