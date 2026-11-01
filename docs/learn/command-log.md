# Learn — the command log

> What [Command log: a record of every command an agent ran](https://github.com/ferrarolabs/jamly/issues/30) built, why it is shaped this way, and the concepts worth knowing. Pilot of agent-kit's [Command log](https://github.com/ferrarolabs/agent-kit/issues/39).

## The feature in one paragraph

Every Bash command an agent runs in this repo is written down: when it ran, the command (with secrets masked), and how it ended — ok, failed with its exit code, or no result at all, which means it was denied. At the end of every turn the log is published as one comment on the issue the branch is named after, and updated in place after that. The comment outlives the cloud container. A real one: [the test run on this issue](https://github.com/ferrarolabs/jamly/issues/30).

## How the code is layered

```
.claude/settings.json            registers one script on five hook events
.claude/hooks/command-log.js
├─ handle(event)                 routes the event; never throws past main
│  ├─ SessionStart → config line (which settings loaded, their hash)
│  ├─ Pre/PostToolUse(Failure) → entryFor() → one JSON line per event
│  └─ Stop → publish() → buildReport() → renderComment() → gh api upsert
├─ redact()                      pure: masks secrets before anything is written
├─ issueFromBranch(), repoFromRemote()   pure: the join key and where to post
└─ main                          stdin → handle → exit 0, always
.claude/logs/<session>.jsonl     the raw log, gitignored
```

The pure functions are where the logic is, so they carry the tests. `handle` is tested against a temporary folder. `publish` was tested for real, against this issue.

## Concepts worth knowing

### 1. Hooks are run by the harness, not by the model

A hook is a command Claude Code runs on an event: before a tool call, after it, at session start, at the end of a turn. The model doesn't choose to run it, and can't skip it. That is why a record belongs in a hook and not in a `CLAUDE.md` line saying "log what you run".

The event arrives as JSON on stdin. Two real ones, trimmed:

```json
{ "hook_event_name": "PreToolUse", "session_id": "19d3…", "tool_use_id": "toolu_01J7…",
  "tool_input": { "command": "false" } }
{ "hook_event_name": "PostToolUseFailure", "tool_use_id": "toolu_01J7…",
  "error": "Exit code 1", "duration_ms": 33 }
```

`tool_use_id` ties the "before" to its "after".

### 2. A denial is an absence

I checked what fires for a command blocked by a deny rule. `PreToolUse` fires. Then nothing: no `PostToolUse`, no failure, no special "denied" event. So the report reads a lone attempt as "no result: denied, or the session ended". It can't tell the two apart, and it says so instead of guessing.

### 3. Why the log isn't committed

The first plan was to commit the log on the branch. It would never work in the cloud. The cloud's own Stop hook refuses to end a session with uncommitted changes. The log changes after every command — including `git commit` itself. Commit, the log changes, the tree is dirty, commit again, forever.

So the file is gitignored, and the durable copy is a comment. An issue comment is also where agent-kit's design already puts the per-issue usage ledger, so both records will sit together.

### 4. Upsert with a marker

One comment per session, updated at every Stop. The comment starts with an invisible HTML marker, `<!-- command-log:<session> -->`. Publishing lists the issue's comments, looks for the marker, and `PATCH`es it if found, `POST`s otherwise. Tested: a second run with the same session updated the comment from 4 to 5 commands; the issue still has one.

### 5. Redaction, and proving each rule matters

The repo and its issues are public, and commands can carry secrets (`Authorization: Bearer …`, a URL with a password). `redact()` masks them before anything is written to disk. Commands mostly name variables (`$GH_TOKEN`), which are fine to log; the patterns catch literal values.

A test that passes proves little. So each pattern was deleted in turn and the suite rerun. The first time, the JWT pattern could be deleted with every test still green: its test case also contained `apikey:`, which another pattern caught. The cases were rewritten so each one needs exactly one pattern. Now removing any of the 11 turns at least one test red.

### 6. A logging hook must never get in the way

If the log fails, the agent's work must not. Every error goes to stderr and the script exits 0. Exit code 2 from a `PreToolUse` hook would block the command — the opposite of what a recorder should do.

## Decisions

- [D58](../process/41-decision-log.md): hooks, a comment per session, not committed.
- Node, not bash: Node is already required by the project, and runs the same on Windows, macOS and Linux. No new dependency.

## Alternatives rejected

- **Commit the log** — the Stop-hook loop above.
- **One comment per command** — floods the issue and its notifications.
- **A log service** (OpenTelemetry) — that's [Telemetry](https://github.com/ferrarolabs/agent-kit/issues/63), later, and it shares this log's join key.

## What running it found

- The payloads above, the denial-as-absence behaviour, and the Stop-hook loop.
- The comment is posted as Elia: the cloud session's token is his. The footer says Claude wrote it.
- It only runs when the session starts in the repo root. A cloud session with several repos starts above them and loads none of their hooks ([agent-kit: Cloud sessions with several repos load no project deny rules](https://github.com/ferrarolabs/agent-kit/issues/103)).

## Where to look

- `.claude/hooks/command-log.js` — the script, top comment first.
- `.claude/hooks/command-log.test.js` — the behaviours, one per test.
- `node .claude/hooks/command-log.js report .claude/logs/<session>.jsonl` — read a log locally.
