/**
 * The repository is the app's only door to Supabase for bands, so these cases
 * pin what everything above it assumes: it never throws at a caller, a bad
 * code is an outcome rather than an exception, and snake_case never escapes
 * this layer (docs/tech/33-conventions.md).
 */

import { createBand, joinBandByCode, rotateInviteCode } from '../band.repo';

const mockRpc = jest.fn();
const mockState = { configured: true };

jest.mock('@/lib/supabase', () => ({
  get isBackendConfigured() {
    return mockState.configured;
  },
  getSupabase: () => ({
    rpc: mockRpc,
  }),
}));

/** postgrest-js returns a thenable builder, which awaits like a promise. */
function resolves(value: unknown) {
  return Promise.resolve(value);
}

const bandRow = {
  id: 'b-1',
  name: 'The Midnight Hours',
  invite_code: 'a1b2c3d4e5f6',
  invite_expires_at: '2026-09-23T09:00:00.000Z',
  created_by: 'u-1',
  created_at: '2026-09-16T09:00:00.000Z',
};

beforeEach(() => {
  mockState.configured = true;
  mockRpc.mockReset();
});

describe('createBand', () => {
  it('maps the row into the domain shape', async () => {
    mockRpc.mockReturnValue(resolves({ data: bandRow, error: null }));

    const result = await createBand('The Midnight Hours');

    expect(result).toEqual({
      ok: true,
      band: {
        id: 'b-1',
        name: 'The Midnight Hours',
        inviteCode: 'a1b2c3d4e5f6',
        inviteExpiresAt: '2026-09-23T09:00:00.000Z',
        createdBy: 'u-1',
        createdAt: '2026-09-16T09:00:00.000Z',
      },
    });
  });

  it('refuses an empty name without troubling the network', async () => {
    const result = await createBand('   ');

    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({ reason: 'nameRequired' }),
    });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('returns a failure rather than throwing when the connection is dead', async () => {
    mockRpc.mockImplementation(() => {
      throw new TypeError('Network request failed');
    });

    const result = await createBand('The Midnight Hours');

    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({ reason: 'offline' }),
    });
  });

  it('says so plainly when the build has no backend', async () => {
    mockState.configured = false;

    const result = await createBand('The Midnight Hours');

    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({ reason: 'backendUnconfigured' }),
    });
    expect(mockRpc).not.toHaveBeenCalled();
  });
});

describe('joinBandByCode', () => {
  it('reports a join', async () => {
    mockRpc.mockReturnValue(
      resolves({
        data: [{ status: 'joined', band_id: 'b-1', band_name: 'The Midnight Hours' }],
        error: null,
      }),
    );

    const result = await joinBandByCode('a1b2c3d4e5f6');

    expect(result).toEqual({
      ok: true,
      outcome: 'joined',
      bandId: 'b-1',
      bandName: 'The Midnight Hours',
    });
  });

  it('treats a second tap on the same link as success, not an error', async () => {
    mockRpc.mockReturnValue(
      resolves({
        data: [{ status: 'already_member', band_id: 'b-1', band_name: 'The Midnight Hours' }],
        error: null,
      }),
    );

    const result = await joinBandByCode('a1b2c3d4e5f6');

    expect(result).toMatchObject({ ok: true, outcome: 'alreadyMember' });
  });

  it('tells an expired link apart from a wrong one', async () => {
    mockRpc.mockReturnValue(
      resolves({
        data: [{ status: 'expired', band_id: null, band_name: null }],
        error: null,
      }),
    );

    await expect(joinBandByCode('a1b2c3d4e5f6')).resolves.toEqual({
      ok: false,
      outcome: 'expired',
    });

    mockRpc.mockReturnValue(
      resolves({
        data: [{ status: 'invalid', band_id: null, band_name: null }],
        error: null,
      }),
    );

    await expect(joinBandByCode('nope')).resolves.toEqual({
      ok: false,
      outcome: 'invalid',
    });
  });
});

describe('rotateInviteCode', () => {
  it('maps the refreshed band back', async () => {
    mockRpc.mockReturnValue(
      resolves({ data: { ...bandRow, invite_code: 'f6e5d4c3b2a1' }, error: null }),
    );

    const result = await rotateInviteCode('b-1');

    expect(result).toMatchObject({ ok: true, band: { inviteCode: 'f6e5d4c3b2a1' } });
  });

  it('turns the database refusal into words a musician can act on', async () => {
    mockRpc.mockReturnValue(
      resolves({ data: null, error: { code: '42501', message: 'permission denied' } }),
    );

    const result = await rotateInviteCode('b-1');

    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({ reason: 'notAllowed' }),
    });
  });
});
