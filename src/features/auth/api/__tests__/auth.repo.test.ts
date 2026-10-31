/**
 * The repository is the app's only door to Supabase, so these cases pin the
 * two properties everything above it assumes: it never throws at a caller, and
 * the email it sends is normalised whatever was typed.
 */

import { AuthApiError } from '@supabase/supabase-js';

import { signInWithPassword, signOut } from '../auth.repo';

const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue({ error: null });
const mockState = { configured: true };

jest.mock('@/lib/supabase', () => ({
  get isBackendConfigured() {
    return mockState.configured;
  },
  getSupabase: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
  }),
}));

beforeEach(() => {
  mockState.configured = true;
  mockSignInWithPassword.mockReset();
  mockSignOut.mockClear();
});

describe('signInWithPassword', () => {
  it('returns the signed-in musician', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'ferraro.eli.99@gmail.com' }, session: {} },
      error: null,
    });

    const result = await signInWithPassword('ferraro.eli.99@gmail.com', 'pw');

    expect(result).toEqual({ ok: true, user: { id: 'u-1', email: 'ferraro.eli.99@gmail.com' } });
  });

  it('normalises the address before it leaves the device', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'ferraro.eli.99@gmail.com' }, session: {} },
      error: null,
    });

    await signInWithPassword('  Ferraro.Eli.99@Gmail.com ', 'pw');

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'ferraro.eli.99@gmail.com',
      password: 'pw',
    });
  });

  it('returns a failure rather than throwing when the password is wrong', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthApiError('Invalid login credentials', 400, 'invalid_credentials'),
    });

    const result = await signInWithPassword('marco@band.it', 'nope');

    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({ reason: 'invalidCredentials' }),
    });
  });

  it('returns a failure rather than throwing when the client rejects', async () => {
    // On a dead connection the auth client rejects instead of resolving.
    mockSignInWithPassword.mockRejectedValue(new TypeError('Network request failed'));

    const result = await signInWithPassword('marco@band.it', 'pw');

    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({ reason: 'offline' }),
    });
  });

  it('says so plainly when the build has no backend', async () => {
    mockState.configured = false;

    const result = await signInWithPassword('marco@band.it', 'pw');

    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({ reason: 'backendUnconfigured' }),
    });
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });
});

describe('signOut', () => {
  it('ends the session on this device only — the tablet on the stand stays in', async () => {
    await signOut();

    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
  });
});
