const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  redact,
  issueFromBranch,
  repoFromRemote,
  entryFor,
  buildReport,
  renderComment,
  handle,
  markerFor,
} = require('./command-log');

const NOW = new Date('2026-11-01T10:00:00Z');
const event = (name, extra = {}) => ({ hook_event_name: name, session_id: 's1', ...extra });

describe('redact', () => {
  // Each case names the exact text that must disappear. Each one is caught by a
  // different pattern, so removing any pattern turns one case red.
  it.each([
    ['echo ghp_abcdefghijklmnopqrstuvwxyz0123', 'ghp_abcdefghijklmnopqrstuvwxyz0123'],
    [
      'echo github_pat_11ABCDEFG0123456789_abcdefghij',
      'github_pat_11ABCDEFG0123456789_abcdefghij',
    ],
    ['echo sk-ant-api03-abcdefghijklmnop', 'sk-ant-api03-abcdefghijklmnop'],
    ['echo sk-abcdefghijklmnopqrstuvwx', 'sk-abcdefghijklmnopqrstuvwx'],
    ['echo sb_secret_abcdefghijkl', 'sb_secret_abcdefghijkl'],
    [
      'curl -H "X-Client: eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.c2lnbmF0dXJlc2ln"',
      'c2lnbmF0dXJlc2ln',
    ],
    ['aws configure set aws_access_key_id AKIAABCDEFGHIJKLMNOP', 'AKIAABCDEFGHIJKLMNOP'],
    ['curl -H "Authorization: Bearer opaque-value-123"', 'opaque-value-123'],
    ['curl "https://x.test/?password=hunter2&user=me"', 'hunter2'],
    ['supabase login --token sbp_0123456789abcdef', 'sbp_0123456789abcdef'],
    ['psql postgres://admin:hunter2@db.example.com/app', 'hunter2'],
  ])('hides the secret in %s', (command, secret) => {
    const out = redact(command);
    expect(out).not.toContain(secret);
    expect(out).toContain('[REDACTED]');
  });

  it('leaves a command without secrets as it is', () => {
    const command = 'npm test -- --watch=false && git push -u origin feat/12-setlist';
    expect(redact(command)).toBe(command);
  });

  it('keeps a variable name, which is not its value', () => {
    expect(redact('gh api -H "Authorization: Bearer $GH_TOKEN" user')).toContain('[REDACTED]');
    expect(redact('echo $GH_TOKEN')).toBe('echo $GH_TOKEN');
  });
});

describe('issueFromBranch', () => {
  it('reads the issue from <type>/<issue>-<slug>', () => {
    expect(issueFromBranch('feat/12-setlist-order')).toBe(12);
    expect(issueFromBranch('chore/30-command-log')).toBe(30);
  });
  it('gives null when the branch names no issue', () => {
    expect(issueFromBranch('dev')).toBeNull();
    expect(issueFromBranch('claude/magical-brown-uxcnx6')).toBeNull();
    expect(issueFromBranch('')).toBeNull();
  });
});

describe('repoFromRemote', () => {
  it.each([
    ['https://github.com/ferrarolabs/jamly', 'ferrarolabs/jamly'],
    ['https://github.com/ferrarolabs/jamly.git', 'ferrarolabs/jamly'],
    ['git@github.com:ferrarolabs/jamly.git', 'ferrarolabs/jamly'],
    ['http://local_proxy@127.0.0.1:41047/git/ferrarolabs/jamly', 'ferrarolabs/jamly'],
  ])('%s → %s', (url, repo) => expect(repoFromRemote(url)).toBe(repo));
  it('gives null for no remote', () => expect(repoFromRemote('')).toBeNull());
});

describe('entryFor', () => {
  it('records an attempt with the redacted command and the join key', () => {
    const entry = entryFor(
      event('PreToolUse', {
        tool_use_id: 't1',
        tool_input: { command: 'echo ghp_abcdefghijklmnopqrstuvwxyz0123' },
      }),
      NOW,
    );
    expect(entry).toEqual({
      ts: '2026-11-01T10:00:00.000Z',
      session: 's1',
      kind: 'attempt',
      id: 't1',
      command: 'echo [REDACTED]',
    });
  });
  it('records a failure with its error', () => {
    expect(
      entryFor(event('PostToolUseFailure', { tool_use_id: 't1', error: 'Exit code 1' }), NOW),
    ).toMatchObject({
      kind: 'failed',
      error: 'Exit code 1',
    });
  });
  it('ignores events it does not log', () => {
    expect(entryFor(event('Notification'), NOW)).toBeNull();
  });
});

describe('buildReport', () => {
  const lines = [
    {
      kind: 'session',
      session: 's1',
      cwd: '/repo',
      project: { deny: 3, ask: 1, allow: 2, sha256: 'abc' },
    },
    { kind: 'attempt', id: 'a', ts: '2026-11-01T10:00:01Z', command: 'echo hi' },
    { kind: 'ok', id: 'a' },
    { kind: 'attempt', id: 'b', ts: '2026-11-01T10:00:02Z', command: 'false' },
    { kind: 'failed', id: 'b', error: 'Exit code 1' },
    { kind: 'attempt', id: 'c', ts: '2026-11-01T10:00:03Z', command: 'git push origin dev' },
  ];

  it('gives each command its outcome, and a denied one none', () => {
    expect(buildReport(lines).rows.map((r) => [r.command, r.outcome])).toEqual([
      ['echo hi', 'ok'],
      ['false', 'failed (Exit code 1)'],
      ['git push origin dev', 'no result: denied, or the session ended'],
    ]);
  });

  it('renders a comment that counts failures and denials and carries its marker', () => {
    const text = renderComment('s1', 30, buildReport(lines));
    expect(text.startsWith(markerFor('s1'))).toBe(true);
    expect(text).toContain('3 commands · 1 failed · 1 with no result');
    expect(text).toContain('project 3 deny / 1 ask / 2 allow');
    expect(text).toContain(
      '| `git push origin dev` | no result: denied, or the session ended |',
    );
  });

  it('says when no project settings were loaded', () => {
    const text = renderComment('s1', 30, buildReport([{ ...lines[0], project: null }]));
    expect(text).toContain('project **none**');
  });

  it('keeps a comment under GitHub’s size limit by dropping the oldest rows', () => {
    const many = Array.from({ length: 2000 }, (_, i) => [
      {
        kind: 'attempt',
        id: `x${i}`,
        ts: '2026-11-01T10:00:00Z',
        command: `echo ${'y'.repeat(50)} ${i}`,
      },
      { kind: 'ok', id: `x${i}` },
    ]).flat();
    const text = renderComment('s1', 30, buildReport(many));
    expect(text.length).toBeLessThanOrEqual(60000);
    expect(text).toContain('echo yyyy');
    expect(text).toContain(' 1999`');
    expect(text).toContain('older rows cut');
  });
});

describe('handle', () => {
  let dir;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'command-log-'));
    fs.mkdirSync(path.join(dir, '.claude'));
    fs.writeFileSync(
      path.join(dir, '.claude', 'settings.json'),
      JSON.stringify({ permissions: { deny: ['x', 'y'] } }),
    );
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  const env = () => ({ CLAUDE_PROJECT_DIR: dir, HOME: dir, COMMAND_LOG_PUBLISH: '0' });
  const log = () =>
    fs
      .readFileSync(path.join(dir, '.claude', 'logs', 's1.jsonl'), 'utf8')
      .trim()
      .split('\n')
      .map((l) => JSON.parse(l));

  it('writes the config line, then one line per event, to the session file', () => {
    handle(event('SessionStart', { cwd: dir, source: 'startup' }), env());
    handle(event('PreToolUse', { tool_use_id: 't', tool_input: { command: 'ls' } }), env());
    handle(event('PostToolUse', { tool_use_id: 't', duration_ms: 5 }), env());
    const [session, attempt, ok] = log();
    expect(session).toMatchObject({
      kind: 'session',
      cwd: dir,
      project: { deny: 2, ask: 0, allow: 0 },
    });
    expect(attempt).toMatchObject({ kind: 'attempt', command: 'ls', session: 's1' });
    expect(ok).toMatchObject({ kind: 'ok', id: 't' });
  });

  it('does not publish when told not to', () => {
    expect(handle(event('Stop'), env())).toBe('not published: COMMAND_LOG_PUBLISH=0');
  });
});
