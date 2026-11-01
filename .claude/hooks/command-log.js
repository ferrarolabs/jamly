#!/usr/bin/env node
// Command log: a record of every Bash command an agent ran in this repo.
//
// Claude Code runs this script as a hook (see .claude/settings.json) and passes the
// event as JSON on stdin. One JSON line per event goes to .claude/logs/<session>.jsonl:
//   session   SessionStart: which settings this session loaded (the config log)
//   attempt   PreToolUse: the agent asked to run a command
//   ok        PostToolUse: it ran and exited 0
//   failed    PostToolUseFailure: it ran and failed, with the error ("Exit code 1")
// A denied command fires PreToolUse and nothing after it, so an attempt without an
// outcome reads as "denied, or the session ended first".
//
// On Stop, the log is upserted as one comment on the issue named by the branch, so
// it outlives a cloud container. The log file itself is gitignored: committing it
// would dirty the tree after every command, and the cloud Stop hook would never let
// the session end.
//
// Every line carries the join key (session id + issue). Secrets are redacted before
// anything is written: the repo is public. A logging hook must never stop the agent,
// so every error goes to stderr and the script exits 0.

const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SECRET_PATTERNS = [
  /\bgh[pousr]_[A-Za-z0-9]{20,}/g, // GitHub tokens
  /\bgithub_pat_[A-Za-z0-9_]{20,}/g,
  /\bsk-ant-[A-Za-z0-9_-]{10,}/g, // Anthropic
  /\bsk-[A-Za-z0-9]{20,}/g,
  /\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{10,}/g, // Supabase keys
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, // JWTs, incl. Supabase anon keys
  /\bAKIA[0-9A-Z]{16}\b/g, // AWS access key id
  /(authorization:\s*(?:bearer|token|basic)\s+)[^\s'"]+/gi,
  /((?:password|passwd|secret|token|api[_-]?key)\s*[=:]\s*)[^\s'"&]+/gi,
  /(--(?:password|token|api-key)[= ])[^\s'"]+/gi,
  /(:\/\/[^/\s:@]+:)[^@\s/]+@/g, // credentials in a URL
];

function redact(text) {
  let out = String(text);
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern, (match, prefix) =>
      typeof prefix === 'string' && match.startsWith(prefix)
        ? `${prefix}[REDACTED]${match.endsWith('@') ? '@' : ''}`
        : '[REDACTED]',
    );
  }
  return out;
}

// feat/12-setlist-order → 12. Branches without an issue number give null.
function issueFromBranch(branch) {
  const match = /^[a-z]+\/(\d+)-/.exec(branch || '');
  return match ? Number(match[1]) : null;
}

// https://github.com/ferrarolabs/jamly(.git), git@github.com:ferrarolabs/jamly.git, or a
// proxy URL ending in /ferrarolabs/jamly → "ferrarolabs/jamly".
function repoFromRemote(url) {
  const match = /[/:]([^/:\s]+)\/([^/\s]+?)(?:\.git)?\/?$/.exec((url || '').trim());
  return match ? `${match[1]}/${match[2]}` : null;
}

function entryFor(event, now = new Date()) {
  const base = { ts: now.toISOString(), session: event.session_id };
  switch (event.hook_event_name) {
    case 'PreToolUse':
      return {
        ...base,
        kind: 'attempt',
        id: event.tool_use_id,
        command: redact(event.tool_input?.command ?? ''),
      };
    case 'PostToolUse':
      return { ...base, kind: 'ok', id: event.tool_use_id, ms: event.duration_ms };
    case 'PostToolUseFailure':
      return {
        ...base,
        kind: event.is_interrupt ? 'interrupted' : 'failed',
        id: event.tool_use_id,
        error: redact(event.error ?? ''),
        ms: event.duration_ms,
      };
    default:
      return null;
  }
}

function settingsSummary(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const json = JSON.parse(raw);
    const p = json.permissions || {};
    return {
      sha256: crypto.createHash('sha256').update(raw).digest('hex').slice(0, 12),
      allow: (p.allow || []).length,
      ask: (p.ask || []).length,
      deny: (p.deny || []).length,
      hooks: Object.keys(json.hooks || {}),
    };
  } catch {
    return null;
  }
}

// One row per command, in the order they were attempted.
function buildReport(lines) {
  const rows = [];
  const byId = new Map();
  let config = null;
  for (const line of lines) {
    if (line.kind === 'session') config = line;
    if (line.kind === 'attempt') {
      const row = {
        ts: line.ts,
        command: line.command,
        outcome: 'no result: denied, or the session ended',
      };
      rows.push(row);
      if (line.id) byId.set(line.id, row);
    }
    const row = line.id && line.kind !== 'attempt' ? byId.get(line.id) : null;
    if (row && line.kind === 'ok') row.outcome = 'ok';
    if (row && line.kind === 'failed') row.outcome = `failed (${line.error || 'error'})`;
    if (row && line.kind === 'interrupted') row.outcome = 'interrupted';
  }
  return { config, rows };
}

function markerFor(session) {
  return `<!-- command-log:${session} -->`;
}

const MAX_COMMENT = 60000;

function renderComment(session, issue, report) {
  const { config, rows } = report;
  const denied = rows.filter((r) => r.outcome.startsWith('no result')).length;
  const failed = rows.filter((r) => r.outcome.startsWith('failed')).length;
  const cell = (s) =>
    String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ⏎ ').replace(/`/g, "'");
  const header = [
    markerFor(session),
    `### Command log · session \`${session}\` · #${issue}`,
    '',
    `${rows.length} commands · ${failed} failed · ${denied} with no result (denied, or the session ended).`,
    config
      ? `Settings loaded: project ${config.project ? `${config.project.deny} deny / ${config.project.ask} ask / ${config.project.allow} allow, sha ${config.project.sha256}` : '**none**'} · user ${config.user ? `${config.user.deny} deny` : 'none'} · started in \`${config.cwd}\`.`
      : 'No session line: the log started mid-session.',
    '',
    '<details><summary>Every command</summary>',
    '',
    '| time (UTC) | command | outcome |',
    '|---|---|---|',
  ];
  const footer = [
    '',
    '</details>',
    '',
    '_Written by `.claude/hooks/command-log.js`, upserted at every Stop._',
  ];
  const body = rows.map(
    (r) => `| ${r.ts.slice(11, 19)} | \`${cell(r.command)}\` | ${cell(r.outcome)} |`,
  );
  let text = [...header, ...body, ...footer].join('\n');
  while (text.length > MAX_COMMENT && body.length > 1) {
    body.shift();
    text = [...header, '| … | _older rows cut to fit a comment_ | |', ...body, ...footer].join(
      '\n',
    );
  }
  return text;
}

function git(cwd, args) {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function logPath(projectDir, session) {
  return path.join(projectDir, '.claude', 'logs', `${session}.jsonl`);
}

function append(file, entry) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(entry)}\n`);
}

function readLog(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function gh(args, input) {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 20000,
  });
}

function publish(projectDir, session) {
  const branch = git(projectDir, ['rev-parse', '--abbrev-ref', 'HEAD']);
  const issue = issueFromBranch(branch);
  const repo = repoFromRemote(git(projectDir, ['remote', 'get-url', 'origin']));
  if (!issue || !repo) return `not published: branch "${branch}" names no issue, or no origin`;
  const body = renderComment(
    session,
    issue,
    buildReport(readLog(logPath(projectDir, session))),
  );
  const marker = markerFor(session);
  const existing = gh([
    'api',
    '--paginate',
    `repos/${repo}/issues/${issue}/comments`,
    '--jq',
    `.[] | select(.body | contains("${marker}")) | .id`,
  ])
    .split('\n')
    .filter(Boolean);
  const payload = JSON.stringify({ body });
  if (existing.length > 0) {
    gh(
      ['api', '-X', 'PATCH', `repos/${repo}/issues/comments/${existing[0]}`, '--input', '-'],
      payload,
    );
    return `updated the command log on ${repo}#${issue}`;
  }
  gh(['api', '-X', 'POST', `repos/${repo}/issues/${issue}/comments`, '--input', '-'], payload);
  return `posted the command log on ${repo}#${issue}`;
}

function handle(event, env = process.env) {
  const projectDir = env.CLAUDE_PROJECT_DIR || event.cwd || process.cwd();
  const session = event.session_id || 'unknown-session';
  const file = logPath(projectDir, session);
  if (event.hook_event_name === 'SessionStart') {
    const home = env.HOME || env.USERPROFILE || '';
    append(file, {
      ts: new Date().toISOString(),
      session,
      kind: 'session',
      source: event.source,
      cwd: event.cwd,
      branch: git(projectDir, ['rev-parse', '--abbrev-ref', 'HEAD']),
      project: settingsSummary(path.join(projectDir, '.claude', 'settings.json')),
      user: home ? settingsSummary(path.join(home, '.claude', 'settings.json')) : null,
    });
    return null;
  }
  if (event.hook_event_name === 'Stop') {
    if (env.COMMAND_LOG_PUBLISH === '0') return 'not published: COMMAND_LOG_PUBLISH=0';
    return publish(projectDir, session);
  }
  const entry = entryFor(event);
  if (entry) append(file, entry);
  return null;
}

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

if (require.main === module) {
  try {
    if (process.argv[2] === 'report') {
      const { config, rows } = buildReport(readLog(process.argv[3]));
      if (config)
        console.log(
          `session ${config.session} · started in ${config.cwd} · project settings: ${config.project ? 'loaded' : 'NONE'}`,
        );
      for (const r of rows) console.log(`${r.ts}  ${r.outcome.padEnd(40)}  ${r.command}`);
    } else {
      const note = handle(JSON.parse(readStdin() || '{}'));
      if (note) process.stderr.write(`command-log: ${note}\n`);
    }
  } catch (error) {
    process.stderr.write(`command-log: ${error.message}\n`);
  }
  process.exit(0);
}

module.exports = {
  redact,
  issueFromBranch,
  repoFromRemote,
  entryFor,
  buildReport,
  renderComment,
  handle,
  markerFor,
};
