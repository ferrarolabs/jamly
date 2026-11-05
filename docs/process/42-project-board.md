# 42 — Project Board

> How work is tracked when most of the code is written by agents. One person decides; several agents build. The board's job is to answer two questions fast: **what needs me right now?** and **what can an agent pick up next?**
>
> The design is generic and lives in agent-kit: [project-boards.md](https://github.com/ferrarolabs/agent-kit/blob/main/docs/project-boards.md), [ADR 0007](https://github.com/ferrarolabs/agent-kit/blob/main/docs/decisions/0007-project-boards.md) and [ADR 0008](https://github.com/ferrarolabs/agent-kit/blob/main/docs/decisions/0008-numeric-priority-and-projects-from-the-template.md). This page says how it applies to jamly, and what jamly adds.

---

## Two layers, on purpose

| Layer                  | Lives in                                                    | Who reads it        | Holds                                 |
| ---------------------- | ----------------------------------------------------------- | ------------------- | ------------------------------------- |
| **Issue type**         | The `ferrarolabs` organization                              | Agents **and** Elia | Feature, Task, Bug, Epic, Decision    |
| **Org issue fields**   | The `ferrarolabs` organization                              | Agents **and** Elia | Stage, Priority, Effort, Review level |
| **Labels**             | The repo ([`.github/labels.yml`](../../.github/labels.yml)) | Agents **and** Elia | Area                                  |
| **The GitHub Project** | A copy of the org template "Agent work"                     | Elia                | Status column and the planning views  |

Agents work from a cloud session that reaches issues, labels and issue fields through the REST API, but **not** GitHub Projects. So everything an agent needs to read or signal is an issue type or an issue field. The Project is a view built on top: it holds no state of its own.

---

## Stage: the handshake

Stage is an org issue field, single select. It answers one question: whose turn is it? The values and their meaning are defined in agent-kit's [issue-structure.md §3](https://github.com/ferrarolabs/agent-kit/blob/main/docs/issue-structure.md#3-issue-fields) ([ADR 0022](https://github.com/ferrarolabs/agent-kit/blob/main/docs/decisions/0022-issue-structure-types-and-fields.md)).

| Stage           | Set by                         | Means                                                                      |
| --------------- | ------------------------------ | -------------------------------------------------------------------------- |
| `Inbox`         | Whoever opens the issue        | Written, not yet ready for an agent.                                       |
| `Ready`         | Elia, only                     | The spec is complete. An agent may start.                                  |
| `Working`       | Agent, when it starts          | Someone is on it. Don't start a second agent.                              |
| `Asking`        | Agent                          | Waiting on Elia: a decision, a plan verdict. The last comment says what.   |
| `In validation` | Agent, when the PR is complete | Code is done. Elia reviews, tries it, checks iOS + Android, offline, dark. |
| `Done`          | On close                       | Closed.                                                                    |

Agents find `Ready` work with the GitHub MCP `list_issues` and a `field_filters` on Stage. GitHub's search API can't filter on it.

**Rules:**

1. An issue that isn't `Ready` is not started by an agent, however obvious it looks.
2. An agent that stops for any reason other than "done" sets `Asking` and says why in a comment.
3. Elia answers in a comment and sets `Ready` again.

**Labels** keep only what can have several values and is jamly's own: `area:harness` for work on how agents operate ([`.github/labels.yml`](../../.github/labels.yml)). The `type:*` labels stay until the issue forms set the type ([agent-kit #147](https://github.com/ferrarolabs/agent-kit/issues/147)). There are no priority, agent-state or epic labels: Priority and Stage are fields, an epic is an Epic issue.

---

## Milestones

One per roadmap milestone ([12-roadmap](../product/12-roadmap.md)), created when the milestone starts — not before. Currently: **v0.1 — The band loop**. Every product issue belongs to one.

---

## The Project

**Nobody builds it by hand and nobody moves its cards.**

- It is created as a copy of the org template [Agent work](https://github.com/orgs/ferrarolabs/projects/3) with `scripts/projects/build-project.js --from-template` in agent-kit. The template's fields, views and workflows come with it; [`.github/project-extra-views.json`](../../.github/project-extra-views.json) adds jamly's own view on top.
- **Status is derived, never set by hand.** It is meant to mirror Stage ([Stage ⇄ Status reconciler](https://github.com/ferrarolabs/agent-kit/issues/78)). When they disagree, Stage wins: it is what the agents act on.

### Status

The template still derives Status from the old labels (`statusFromLabels` in the kit's [`project-template.json`](https://github.com/ferrarolabs/agent-kit/blob/main/scripts/projects/project-template.json)). It is redefined on issue fields by [Define the project template's board](https://github.com/ferrarolabs/agent-kit/issues/140). Until then the board is not used.

### Views

The template's views: **Needs me**, **Flow**, **Ready for agents**, **Stalled**, **Milestone**, **Shipped**, sorted by Priority. They are redefined with the board ([agent-kit #140](https://github.com/ferrarolabs/agent-kit/issues/140)).

jamly had one extra view, **Audit inbox** (`is:open label:type:audit`). `type:audit` is dropped: an auditor's proposal is its own type with Stage `Inbox`. The view comes back on issue fields with the board, so [`.github/project-extra-views.json`](../../.github/project-extra-views.json) is empty for now.

---

## Not built yet

Said plainly, so nobody assumes otherwise:

- **The jamly Project doesn't exist right now.** The first one was built before the template and was deleted (ADR 0008). It is recreated as a copy once the template is finalised by hand ([Configure the "Agent work" project template once](https://github.com/ferrarolabs/agent-kit/issues/20), [Create the Jamly and agent-kit projects as copies](https://github.com/ferrarolabs/agent-kit/issues/22)).
- **The reconciler that mirrors Stage into Status isn't built** ([Stage ⇄ Status reconciler](https://github.com/ferrarolabs/agent-kit/issues/78)). Until it is, only the template's built-in workflows move Status (added, closed, merged).

Until then, the issue list answers the two questions, filtered on the Stage field:

- What needs me? Stage `Asking` or `In validation`.
- What can an agent pick up? Stage `Ready`.

---

**Related:** [40 — Ways of Working](40-ways-of-working.md) · [41 — Decision Log](41-decision-log.md) · [12 — Roadmap](../product/12-roadmap.md)
