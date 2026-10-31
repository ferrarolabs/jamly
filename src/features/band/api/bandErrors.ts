import type { BandFailure } from '../types';

/**
 * Turns whatever Postgres said into something a musician can act on.
 *
 * The SQLSTATEs below are raised deliberately by the functions in
 * supabase/migrations/20260916090000_bands.sql — they are this layer's
 * contract with the database, not incidental Postgres noise.
 */

const messages: Record<BandFailure['reason'], string> = {
  notSignedIn: 'Sign in again to do that.',
  nameRequired: 'Give your band a name first.',
  notAllowed: 'Only a band leader can do that.',
  notInBand: "Couldn't save — you may no longer be in this band.",
  offline: "Can't reach Jamly — check your connection.",
  backendUnconfigured: 'This build has no backend configured yet.',
  unknown: 'Something went wrong. Try again.',
};

export function bandFailure(reason: BandFailure['reason']): BandFailure {
  return { reason, message: messages[reason] };
}

function looksOffline(error: unknown): boolean {
  return (
    error instanceof Error &&
    /network request failed|fetch failed|failed to fetch|timeout/i.test(error.message)
  );
}

/** postgrest-js errors carry `code`; a thrown TypeError does not. */
function codeOf(error: unknown): string | null {
  if (error && typeof error === 'object' && 'code' in error) {
    const { code } = error as { code?: unknown };
    if (typeof code === 'string') return code;
  }
  return null;
}

export function toBandFailure(error: unknown): BandFailure {
  if (looksOffline(error)) return bandFailure('offline');

  switch (codeOf(error)) {
    case '28000':
      return bandFailure('notSignedIn');
    case '22023':
      return bandFailure('nameRequired');
    case '42501':
      return bandFailure('notAllowed');
    default:
      return bandFailure('unknown');
  }
}
