import type { Band, MemberRole, Timestamp, Uuid } from '@/types/domain';

/**
 * The band slice's types.
 *
 * Nothing here is shaped like a Supabase response: the repository maps at the
 * boundary (docs/tech/33-conventions.md).
 */

/** A band as this musician sees it — the band, plus who they are inside it. */
export type BandMembership = {
  band: Band;
  role: MemberRole;
  joinedAt: Timestamp;
};

/**
 * A person in a band, as the roster shows them.
 *
 * No email: bandmates can see who plays what, not how to contact each other.
 * That is a deliberate limit of `band_roster()` in the migration, not an
 * oversight — widening it later is a decision, and it should look like one.
 */
export type RosterMember = {
  userId: Uuid;
  displayName: string | null;
  role: MemberRole;
  instruments: string[];
  joinedAt: Timestamp;
};

/**
 * Why something in this slice did not happen.
 *
 * Screens get a state, never an exception, and never an error code
 * (docs/tech/33-conventions.md).
 */
export type BandFailureReason =
  | 'notSignedIn'
  | 'nameRequired'
  | 'notAllowed'
  | 'notInBand'
  | 'offline'
  | 'backendUnconfigured'
  | 'unknown';

export type BandFailure = {
  reason: BandFailureReason;
  /** Shown to the user. Musicians' language. */
  message: string;
};

export type CreateBandResult = { ok: true; band: Band } | { ok: false; failure: BandFailure };

export type RotateInviteResult = { ok: true; band: Band } | { ok: false; failure: BandFailure };

/** Story A4. On success, the list as the database now holds it. */
export type UpdateInstrumentsResult =
  { ok: true; instruments: string[] } | { ok: false; failure: BandFailure };

/**
 * What happened when a code was redeemed.
 *
 * `alreadyMember` is a success, not an error: tapping the same link twice is
 * something people do, and the join budget has no room for a dead end that was
 * really a success (story A3).
 *
 * One literal `outcome` per member, rather than a union inside one of them, so
 * that `outcome` is a real discriminant and reading `failure` is only possible
 * on the branch that has one.
 */
export type JoinResult =
  | { ok: true; outcome: 'joined' | 'alreadyMember'; bandId: Uuid; bandName: string }
  | { ok: false; outcome: 'invalid' }
  | { ok: false; outcome: 'expired' }
  | { ok: false; outcome: 'failed'; failure: BandFailure };
