# 42 — Project Board

> How work is tracked when most of the code is written by agents. One person decides; several agents build. The board's job is to answer two questions fast: **what needs me right now?** and **what can an agent pick up next?**
>
> The design is generic and lives in agent-kit: [project-boards.md](https://github.com/ferrarolabs/agent-kit/blob/main/docs/project-boards.md), [ADR 0007](https://github.com/ferrarolabs/agent-kit/blob/main/docs/decisions/0007-project-boards.md) and [ADR 0008](https://github.com/ferrarolabs/agent-kit/blob/main/docs/decisions/0008-numeric-priority-and-projects-from-the-template.md). This page says how it applies to jamly, and what jamly adds.

---

## Two layers, on purpose

| Layer                  | Lives in                                                    | Who reads it        | Holds                                    |
| ---------------------- | ----------------------------------------------------------- | ------------------- | ---------------------------------------- |
| **Labels**             | The repo ([`.github/labels.yml`](../../.github/labels.yml)) | Agents **and** Elia | Type, agent state, epic                  |
| **Org issue fields**   | The `ferrarolabs` organization                              | Agents **and** Elia | Priority (1–100, 100 = do first), Effort |
| **The GitHub Project** | A copy of the org template "Agent work"                     | Elia                | Status column and the planning views     |

Agents work from a cloud session that reaches issues, labels and issue fields through the REST API, but **not** GitHub Projects. So everything an agent needs to read or signal is a label or an issue field. The Project is a view built on top: it holds no state of its own.

---

## Labels

The full list, with colours and descriptions, is in [`.github/labels.yml`](../../.github/labels.yml). The ones that carry the workflow:

| Label                | Set by                      | Means                                                                   |
| -------------------- | --------------------------- | ----------------------------------------------------------------------- |
| `agent:ready`        | Elia                        | The spec is complete. An agent may start.                               |
| `agent:working`      | Agent, when it starts       | Someone is on it. Don't start a second agent.                           |
| `needs:elia`         | Agent or Elia               | Blocked on Elia: a product decision, a plan to approve, a PR to review. |
| `needs:device-check` | Agent, when the PR is green | Code is done. Elia checks iOS + Android, offline, dark.                 |

Plus one `type:*` per issue, and one `epic:*` for product work (`area:harness` for work on how agents operate). There are no priority labels: Priority is the org field.

**Rules:**

1. An issue without `agent:ready` is not started by an agent, however obvious it looks.
2. An agent that stops for any reason other than "done" adds `needs:elia` and says why in a comment.
3. `needs:*` labels are removed by Elia when he's dealt with them.

The agent labels are due to be replaced by an org issue field, Stage ([ADR 0009](https://github.com/ferrarolabs/agent-kit/blob/main/docs/decisions/0009-issue-data-in-issue-fields.md), [Replace the agent labels with Stage](https://github.com/ferrarolabs/agent-kit/issues/82)). Until that lands, labels are the handshake.

---

## Milestones

One per roadmap milestone ([12-roadmap](../product/12-roadmap.md)), created when the milestone starts — not before. Currently: **v0.1 — The band loop**. Every product issue belongs to one.

---

## The Project

**Nobody builds it by hand and nobody moves its cards.**

- It is created as a copy of the org template [Agent work](https://github.com/orgs/ferrarolabs/projects/3) with `scripts/projects/build-project.js --from-template` in agent-kit. The template's fields, views and workflows come with it; [`.github/project-extra-views.json`](../../.github/project-extra-views.json) adds jamly's own view on top.
- **Status is derived, never set by hand.** It follows the labels and the issue and PR events. When they disagree, the labels win: they are what the agents act on.

### Status from labels

| Status       | Comes from                  |
| ------------ | --------------------------- |
| Inbox        | added, no agent label       |
| Ready        | `agent:ready`               |
| In progress  | `agent:working`             |
| Needs me     | `needs:elia`, or an open PR |
| Device check | `needs:device-check`        |
| Done         | closed or merged            |

The mapping is `statusFromLabels` in the kit's [`project-template.json`](https://github.com/ferrarolabs/agent-kit/blob/main/scripts/projects/project-template.json).

### Views

The template's views: **Needs me**, **Flow**, **Ready for agents**, **Stalled**, **Milestone**, **Shipped**, sorted by Priority. jamly adds one:

| View            | Layout | Filter                     | Answers                        |
| --------------- | ------ | -------------------------- | ------------------------------ |
| **Audit inbox** | Table  | `is:open label:type:audit` | What has the auditor proposed? |

---

## Not built yet

Said plainly, so nobody assumes otherwise:

- **The jamly Project doesn't exist right now.** The first one was built before the template and was deleted (ADR 0008). It is recreated as a copy once the template is finalised by hand ([Configure the "Agent work" project template once](https://github.com/ferrarolabs/agent-kit/issues/20), [Create the Jamly and agent-kit projects as copies](https://github.com/ferrarolabs/agent-kit/issues/22)).
- **The Action that sets Status from labels isn't built** ([Action: keep project Status in step with labels](https://github.com/ferrarolabs/agent-kit/issues/19)). Until it is, only the template's built-in workflows move Status (added, closed, merged).

Until then, the labels and these saved searches answer the two questions:

- What needs me? `is:open label:needs:elia,needs:device-check repo:ferrarolabs/jamly`
- What can an agent pick up? `is:open label:agent:ready -label:agent:working repo:ferrarolabs/jamly`

---

**Related:** [40 — Ways of Working](40-ways-of-working.md) · [41 — Decision Log](41-decision-log.md) · [12 — Roadmap](../product/12-roadmap.md)
