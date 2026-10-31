/**
 * Story A4. The update is the first direct table write in the band slice, so
 * these pin what it may touch: only `instruments`, only on my own membership
 * row in this band — and, like the rest of the repository, it never throws.
 */

import { updateMyInstruments } from '../band.repo';

const mockState = { configured: true };

const mockCalls = {
  from: jest.fn(),
  update: jest.fn(),
  eq: jest.fn(),
  select: jest.fn(),
};
let mockResponse: unknown = { data: [], error: null };
let mockThrow: Error | null = null;

/** A stand-in for the postgrest-js mockBuilder: every step chains, the end awaits. */
const mockBuilder = {
  update: (...args: unknown[]) => (mockCalls.update(...args), mockBuilder),
  eq: (...args: unknown[]) => (mockCalls.eq(...args), mockBuilder),
  select: (...args: unknown[]) => (mockCalls.select(...args), mockBuilder),
  returns: () => Promise.resolve(mockResponse),
};

jest.mock('@/lib/supabase', () => ({
  get isBackendConfigured() {
    return mockState.configured;
  },
  getSupabase: () => ({
    from: (table: string) => {
      mockCalls.from(table);
      if (mockThrow) throw mockThrow;
      return mockBuilder;
    },
  }),
}));

beforeEach(() => {
  mockState.configured = true;
  mockThrow = null;
  mockResponse = { data: [{ instruments: ['drums', 'vox'] }], error: null };
  Object.values(mockCalls).forEach((fn) => fn.mockReset());
});

describe('updateMyInstruments', () => {
  it('sends only instruments, for my own row in this band', async () => {
    const result = await updateMyInstruments('b-1', 'u-1', ['drums', 'vox']);

    expect(mockCalls.from).toHaveBeenCalledWith('band_members');
    expect(mockCalls.update).toHaveBeenCalledWith({ instruments: ['drums', 'vox'] });
    expect(mockCalls.eq).toHaveBeenCalledWith('band_id', 'b-1');
    expect(mockCalls.eq).toHaveBeenCalledWith('user_id', 'u-1');
    expect(result).toEqual({ ok: true, instruments: ['drums', 'vox'] });
  });

  it('trims, drops empties and drops duplicates ignoring case before sending', async () => {
    await updateMyInstruments('b-1', 'u-1', [' drums ', '', 'Vox', 'vox', 'DRUMS']);

    expect(mockCalls.update).toHaveBeenCalledWith({ instruments: ['drums', 'Vox'] });
  });

  it('saves an empty list — clearing is allowed', async () => {
    mockResponse = { data: [{ instruments: [] }], error: null };

    const result = await updateMyInstruments('b-1', 'u-1', []);

    expect(mockCalls.update).toHaveBeenCalledWith({ instruments: [] });
    expect(result).toEqual({ ok: true, instruments: [] });
  });

  it('treats an update RLS filtered out (no row back) as a typed refusal', async () => {
    mockResponse = { data: [], error: null };

    const result = await updateMyInstruments('b-1', 'u-1', ['drums']);

    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({ reason: 'notInBand' }),
    });
  });

  it('turns a permission error into a typed refusal, not a leader message', async () => {
    mockResponse = { data: null, error: { code: '42501', message: 'permission denied' } };

    const result = await updateMyInstruments('b-1', 'u-1', ['drums']);

    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({ reason: 'notInBand' }),
    });
  });

  it('returns a failure rather than throwing when the connection is dead', async () => {
    mockThrow = new TypeError('Network request failed');

    const result = await updateMyInstruments('b-1', 'u-1', ['drums']);

    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({ reason: 'offline' }),
    });
  });

  it('reads a dead connection that postgrest returns rather than throws as offline', async () => {
    // The shape postgrest-js actually returns when fetch fails, seen running the app.
    mockResponse = {
      data: null,
      error: { message: 'TypeError: Failed to fetch', details: '', hint: '', code: '' },
    };

    const result = await updateMyInstruments('b-1', 'u-1', ['drums']);

    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({ reason: 'offline' }),
    });
  });

  it('says so plainly when the build has no backend', async () => {
    mockState.configured = false;

    const result = await updateMyInstruments('b-1', 'u-1', ['drums']);

    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({ reason: 'backendUnconfigured' }),
    });
    expect(mockCalls.from).not.toHaveBeenCalled();
  });
});
