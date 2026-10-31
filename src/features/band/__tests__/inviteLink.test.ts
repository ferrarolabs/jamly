/**
 * The link is the flow the whole product depends on (story A3), and this is
 * the part of it that runs before anything reaches the server: whatever the
 * musician actually had to hand has to turn into a code, or into nothing.
 */

import { buildInviteMessage, buildInviteUrl, parseInviteCode } from '../inviteLink';

jest.mock('expo-linking', () => ({
  createURL: (path: string) => `jamly://${path}`,
}));

describe('buildInviteUrl', () => {
  it('builds a link this build can actually open', () => {
    expect(buildInviteUrl('a1b2c3d4e5f6')).toBe('jamly://join/a1b2c3d4e5f6');
  });
});

describe('buildInviteMessage', () => {
  it('names the band, because a bare link from a leader is a link nobody taps', () => {
    const message = buildInviteMessage('The Midnight Hours', 'jamly://join/abc123');

    expect(message).toContain('The Midnight Hours');
    expect(message).toContain('jamly://join/abc123');
  });
});

describe('parseInviteCode', () => {
  it('takes a bare code', () => {
    expect(parseInviteCode('a1b2c3d4e5f6')).toBe('a1b2c3d4e5f6');
  });

  it('takes the whole link, which is what actually gets pasted', () => {
    expect(parseInviteCode('jamly://join/a1b2c3d4e5f6')).toBe('a1b2c3d4e5f6');
    expect(parseInviteCode('https://jamly.app/join/a1b2c3d4e5f6')).toBe('a1b2c3d4e5f6');
  });

  it('survives the tracking junk a chat app staples on', () => {
    expect(parseInviteCode('https://jamly.app/join/a1b2c3d4e5f6?utm=whatsapp')).toBe(
      'a1b2c3d4e5f6',
    );
  });

  it('forgives the whitespace that comes with a copy and paste', () => {
    expect(parseInviteCode('  a1b2c3d4e5f6\n')).toBe('a1b2c3d4e5f6');
  });

  it('refuses what is not a code, so a typo never becomes a round trip', () => {
    expect(parseInviteCode('')).toBeNull();
    expect(parseInviteCode('   ')).toBeNull();
    expect(parseInviteCode('not a code')).toBeNull();
    expect(parseInviteCode('https://jamly.app/join/')).toBeNull();
    expect(parseInviteCode('ab')).toBeNull();
  });
});
