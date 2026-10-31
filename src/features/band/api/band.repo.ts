import { getSupabase, isBackendConfigured } from '@/lib/supabase';
import type { Band, MemberRole, Uuid } from '@/types/domain';
import type {
  BandMembership,
  CreateBandResult,
  JoinResult,
  RosterMember,
  RotateInviteResult,
  UpdateInstrumentsResult,
} from '../types';
import { normaliseInstruments } from '../instruments';
import { bandFailure, toBandFailure } from './bandErrors';

/**
 * Everything the app knows how to do with a band.
 *
 * The only module in this slice that touches Supabase (docs/tech/33-conventions.md).
 * `bandId` is always an explicit argument and never resolved in here from "the
 * current band": multi-band is v0.2, but the schema has always supported it,
 * and an implicit band in the data layer is the one part of that which would
 * be expensive to undo.
 */

const BAND_COLUMNS = 'id, name, invite_code, invite_expires_at, created_by, created_at';

type BandRow = {
  id: string;
  name: string;
  invite_code: string;
  invite_expires_at: string;
  created_by: string;
  created_at: string;
};

type MembershipRow = {
  role: MemberRole;
  joined_at: string;
  band: BandRow | null;
};

type RosterRow = {
  user_id: string;
  display_name: string | null;
  role: MemberRole;
  instruments: string[] | null;
  joined_at: string;
};

type JoinRow = {
  status: 'joined' | 'already_member' | 'invalid' | 'expired';
  band_id: string | null;
  band_name: string | null;
};

function toBand(row: BandRow): Band {
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    inviteExpiresAt: row.invite_expires_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function toRosterMember(row: RosterRow): RosterMember {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    role: row.role,
    instruments: row.instruments ?? [],
    joinedAt: row.joined_at,
  };
}

/**
 * Every band this musician belongs to, most recently joined first.
 *
 * Returns a list even though v0.1 shows one band: the join table has always
 * been many-to-many, and a musician who creates a band and joins a friend's
 * has two memberships on day one — long before the v0.2 switcher exists.
 */
export async function getMyBands(userId: Uuid): Promise<BandMembership[]> {
  if (!isBackendConfigured) return [];

  const { data, error } = await getSupabase()
    .from('band_members')
    .select(`role, joined_at, band:bands(${BAND_COLUMNS})`)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .returns<MembershipRow[]>();

  if (error) throw error;

  return (data ?? [])
    .filter((row): row is MembershipRow & { band: BandRow } => row.band !== null)
    .map((row) => ({
      band: toBand(row.band),
      role: row.role,
      joinedAt: row.joined_at,
    }));
}

/** Who is in the band. Names and instruments only — never contact details. */
export async function getBandRoster(bandId: Uuid): Promise<RosterMember[]> {
  if (!isBackendConfigured) return [];

  const { data, error } = await getSupabase().rpc('band_roster', { band: bandId });

  if (error) throw error;

  // No generated Database type exists yet, so an RPC result arrives untyped.
  // The shape is asserted here, at the boundary, and mapped on the next line —
  // which is the same place every other snake_case detail stops.
  return ((data ?? []) as RosterRow[]).map(toRosterMember);
}

/**
 * Story A2. The band and its first membership are created together, in one
 * transaction, inside the database — see the note on `create_band` in the
 * migration for why this is not two inserts from here.
 */
export async function createBand(name: string): Promise<CreateBandResult> {
  if (!isBackendConfigured) {
    return { ok: false, failure: bandFailure('backendUnconfigured') };
  }

  if (!name.trim()) {
    return { ok: false, failure: bandFailure('nameRequired') };
  }

  try {
    const { data, error } = await getSupabase().rpc('create_band', { band_name: name });

    if (error) return { ok: false, failure: toBandFailure(error) };

    const row = data as BandRow | null;
    if (!row) return { ok: false, failure: bandFailure('unknown') };

    return { ok: true, band: toBand(row) };
  } catch (cause) {
    return { ok: false, failure: toBandFailure(cause) };
  }
}

/**
 * Story A3. A wrong or stale code is an outcome, not an exception: the join
 * screen has to say something useful about it in words.
 */
export async function joinBandByCode(code: string): Promise<JoinResult> {
  if (!isBackendConfigured) {
    return { ok: false, outcome: 'failed', failure: bandFailure('backendUnconfigured') };
  }

  try {
    const { data, error } = await getSupabase().rpc('join_band_by_code', { code });

    if (error) return { ok: false, outcome: 'failed', failure: toBandFailure(error) };

    const row = (data as JoinRow[] | null)?.[0];
    if (!row) return { ok: false, outcome: 'failed', failure: bandFailure('unknown') };

    if (row.status === 'invalid') return { ok: false, outcome: 'invalid' };
    if (row.status === 'expired') return { ok: false, outcome: 'expired' };

    if (!row.band_id || !row.band_name) {
      return { ok: false, outcome: 'failed', failure: bandFailure('unknown') };
    }

    return {
      ok: true,
      outcome: row.status === 'joined' ? 'joined' : 'alreadyMember',
      bandId: row.band_id,
      bandName: row.band_name,
    };
  } catch (cause) {
    return { ok: false, outcome: 'failed', failure: toBandFailure(cause) };
  }
}

/** What a leader does when a link ends up somewhere it shouldn't have. */
export async function rotateInviteCode(bandId: Uuid): Promise<RotateInviteResult> {
  if (!isBackendConfigured) {
    return { ok: false, failure: bandFailure('backendUnconfigured') };
  }

  try {
    const { data, error } = await getSupabase().rpc('rotate_invite_code', { band: bandId });

    if (error) return { ok: false, failure: toBandFailure(error) };

    const row = data as BandRow | null;
    if (!row) return { ok: false, failure: bandFailure('unknown') };

    return { ok: true, band: toBand(row) };
  } catch (cause) {
    return { ok: false, failure: toBandFailure(cause) };
  }
}

/**
 * Story A4: what I play in this band.
 *
 * Writes only `instruments`, and only on my own membership row. The database
 * enforces both anyway — a column grant and an update policy in
 * 20260916090000_bands.sql — so this is the app agreeing with it, not the
 * security boundary.
 *
 * Instruments are per band: the row is picked by band AND user, so another
 * band's list is never touched.
 */
export async function updateMyInstruments(
  bandId: Uuid,
  userId: Uuid,
  instruments: readonly string[],
): Promise<UpdateInstrumentsResult> {
  if (!isBackendConfigured) {
    return { ok: false, failure: bandFailure('backendUnconfigured') };
  }

  try {
    const { data, error } = await getSupabase()
      .from('band_members')
      .update({ instruments: normaliseInstruments(instruments) })
      .eq('band_id', bandId)
      .eq('user_id', userId)
      .select('instruments')
      .returns<{ instruments: string[] | null }[]>();

    if (error) return { ok: false, failure: toInstrumentsFailure(error) };

    // Row-level security does not raise on an update it filters out: it
    // updates nothing and says nothing. No row back means it was refused, most
    // likely because I am no longer in the band.
    const row = data?.[0];
    if (!row) return { ok: false, failure: bandFailure('notInBand') };

    return { ok: true, instruments: row.instruments ?? [] };
  } catch (cause) {
    return { ok: false, failure: toInstrumentsFailure(cause) };
  }
}

/** "Only a band leader can do that" would be wrong here: nobody else can do it either. */
function toInstrumentsFailure(error: unknown) {
  const failure = toBandFailure(error);
  return failure.reason === 'notAllowed' ? bandFailure('notInBand') : failure;
}
