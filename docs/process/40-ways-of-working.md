# 40 — Ways of Working

> How a solo, part-time project stays alive for a year. The bottleneck is not skill — it is momentum ([R4](../business/06-risks-and-open-questions.md)).

---

## The rhythm

**One milestone at a time. One feature at a time. Always something visible.**

| Cadence                | Practice                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Each session**       | Start by reading the current milestone's scope. End with the code committed and running, even if unfinished              |
| **Each week**          | At least one user-visible change. A week of pure refactoring is a warning sign                                           |
| **Each milestone**     | Ends with real people using it. A milestone that ships to nobody hasn't shipped ([12-roadmap](../product/12-roadmap.md)) |
| **Each milestone end** | Re-read [06-risks](../business/06-risks-and-open-questions.md) and update the docs that reality has contradicted         |

**After a gap:** don't try to remember. Read [11-mvp-scope](../product/11-mvp-scope.md), the [decision log](41-decision-log.md), and `git log`. The documents exist precisely so that returning costs an hour, not a week.

---

## Working rules

### 1. Finish before starting

Only one feature in progress. If something is blocked, note the blocker and finish the _smallest_ thing that reaches "done", rather than opening a second front. Half-finished parallel work is how a project becomes intimidating to open.

### 2. New ideas go to the inventory, immediately

A good idea mid-feature is a threat, not a gift. Write it into [10-feature-inventory](../product/10-feature-inventory.md) and return to what you were doing. The idea is safe; the momentum isn't.

### 3. Ship ugly before shipping nothing

A working screen with mediocre spacing beats a perfect screen that doesn't exist. Polish is a milestone (v1.0), not a permanent state.

### 4. The definition of done is real

From [33-conventions](../tech/33-conventions.md): both platforms, types pass, lint passes, works offline if it's a read path, respects the theme, decisions recorded. "It works on my phone" is not done.

### 5. Real users beat discipline

Someone waiting for a feature is worth more than any productivity technique. Get a real band on v0.1 as early as it's usable, even embarrassingly early.

### 6. Document the _why_, not the _what_

The code says what. Documents say why. Significant technical decisions → an [ADR](../tech/adr/README.md); everything else → the [decision log](41-decision-log.md). Two minutes now, an hour saved later.

### 7. Timebox the rabbit holes

Two hours stuck on one problem → write down what was tried, and move to something else. The answer usually arrives on the way back.

---

## Milestone workflow

```
1. Read the scope        11-mvp-scope.md or 12-roadmap.md
2. List the work         concrete tasks from user stories
3. Build vertically      one full story at a time, screen → hook → repo → SQL
4. Test on real devices  iOS + Android, and physically for stage/offline criteria
5. Ship to real users    even a single band
6. Learn                 check metrics against 14-validation-plan.md
7. Update the docs       reality wins; the docs change to match
```

**Build vertically, never in horizontal layers.** One complete story — screen, hook, repository, migration — beats "all the screens" followed by "all the data". Vertical slices are always demoable, and demoable is what sustains motivation.

---

## Definition of done (the short version)

Pinned here because it's the rule most often bent:

- [ ] Works on iOS **and** Android
- [ ] Typecheck, lint, tests pass
- [ ] Read paths work offline
- [ ] Legible in the dark, tokens respected
- [ ] Decisions recorded
- [ ] Contradicted docs updated

---

## Keeping the docs honest

The failure mode of documentation is silent decay — and this project has a lot of it.

**Rules:**

1. Docs change **in the same commit** as the code that contradicts them.
2. At every milestone end, re-read `docs/README.md` and check each linked doc for statements that reality has falsified.
3. **A wrong document is worse than no document.** Delete rather than leave stale.
4. Assumptions carry an explicit `ASSUMPTION:` tag so they can be found and tested later ([14-validation-plan](../product/14-validation-plan.md)).
5. ADRs are never edited — a changed decision gets a new ADR that supersedes the old one.

---

## Metrics reviewed at each milestone

From [14-validation-plan](../product/14-validation-plan.md). Two numbers matter more than the rest:

- **Active bands** (north star) — bands with ≥60% of members active in 14 days
- **Passive-member weekly activity** — the direct test of the thesis ([R2](../business/06-risks-and-open-questions.md))

A rising user count with flat passive-member activity means the product is failing while the vanity metric hides it.

---

## Working with AI assistance

This project is built with substantial AI assistance, which changes what needs writing down.

- **`CLAUDE.md` in the repo root** carries the project context an assistant needs at the start of a session.
- **Point at documents rather than re-explaining.** The docs are the shared context; that's a large part of why they're this thorough.
- **Decisions still get recorded by hand.** An assistant will happily make a reasonable choice; if the reasoning isn't captured in an ADR or the decision log, it's lost by the next session.
- **Review generated code against [33-conventions](../tech/33-conventions.md)** — particularly the rule that screens never touch the Supabase client, which is exactly the kind of shortcut a generated snippet takes.
- **Never let generated code introduce a dependency** that isn't justified in [31-stack](../tech/31-stack.md).

---

## Anti-patterns

Specific ways this project would die:

- ❌ **Building v0.2 features during v0.1** — the classic ([R1](../business/06-risks-and-open-questions.md))
- ❌ **A month of refactoring with nothing user-visible**
- ❌ **Waiting for perfect before showing anyone**
- ❌ **Adding a dependency to avoid writing thirty lines**
- ❌ **Building for imagined scale** — there are no thousands of users, and design for them costs the real ones
- ❌ **Letting the docs drift** until they're untrustworthy, at which point they're dead weight
- ❌ **Skipping real-device testing** — the simulator is always fast enough and always lying

---

**Related:** [41 — Decision Log](41-decision-log.md) · [33 — Conventions](../tech/33-conventions.md) · [12 — Roadmap](../product/12-roadmap.md) · [06 — Risks](../business/06-risks-and-open-questions.md)
