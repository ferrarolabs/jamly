import { formatDuration, totalDuration } from '../duration';

describe('formatDuration', () => {
  it('formats under an hour as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(599)).toBe('9:59');
  });

  it('formats an hour or more as h:mm:ss', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(5445)).toBe('1:30:45');
  });

  it('returns a dash rather than nonsense for invalid input', () => {
    expect(formatDuration(-1)).toBe('—');
    expect(formatDuration(Number.NaN)).toBe('—');
  });
});

describe('totalDuration', () => {
  it('sums a set', () => {
    expect(totalDuration([{ durationSeconds: 210 }, { durationSeconds: 185 }])).toBe(395);
  });

  it('treats missing durations as zero rather than losing the total', () => {
    // A song without a duration must not make the running time disappear —
    // the leader needs "do we have 90 minutes?" answered even with gaps.
    expect(totalDuration([{ durationSeconds: 210 }, { durationSeconds: null }, {}])).toBe(210);
  });

  it('handles an empty set', () => {
    expect(totalDuration([])).toBe(0);
  });
});
