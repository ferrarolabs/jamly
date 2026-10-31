import type { Session, User } from '@supabase/supabase-js';

import { getSupabase, isBackendConfigured } from '@/lib/supabase';
import { normalizeEmail } from '../credentials';
import type { AuthUser, SignInResult } from '../types';
import { authFailure, toAuthFailure } from './authErrors';

/**
 * Everything the app knows how to do with an identity.
 *
 * The only module in the auth slice that touches Supabase. Screens and hooks
 * import from here, never from `@/lib/supabase` (docs/tech/33-conventions.md) —
 * which is also what makes swapping password for email OTP (ADR-0008) a change
 * to this file and nothing else.
 */

function toAuthUser(user: User): AuthUser {
  // GoTrue types `email` as optional because phone-only accounts exist. Jamly
  // has none, so an account without one is a broken account, not a valid state.
  return { id: user.id, email: user.email ?? '' };
}

export async function signInWithPassword(
  rawEmail: string,
  password: string,
): Promise<SignInResult> {
  if (!isBackendConfigured) {
    return { ok: false, failure: authFailure('backendUnconfigured') };
  }

  try {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      // Normalised here as well as in the form: this is the single choke point
      // every sign-in passes through, whatever calls it.
      email: normalizeEmail(rawEmail),
      password,
    });

    if (error) return { ok: false, failure: toAuthFailure(error) };
    if (!data.user) return { ok: false, failure: authFailure('unknown') };

    return { ok: true, user: toAuthUser(data.user) };
  } catch (cause) {
    // signInWithPassword rejects rather than returning on a dead connection.
    return { ok: false, failure: toAuthFailure(cause) };
  }
}

/**
 * Ends the session on this device and clears it from the keystore.
 *
 * Scoped to `local` deliberately: signing out of the phone must not sign the
 * same musician out of the tablet on their music stand, mid-set.
 */
export async function signOut(): Promise<void> {
  if (!isBackendConfigured) return;
  await getSupabase().auth.signOut({ scope: 'local' });
}

/**
 * The session already on this device, if any.
 *
 * Read from storage without a network round trip, so a cold start on a venue's
 * hostile wifi still opens signed in. The token is not verified here and does
 * not need to be: it gates the UI, while row-level security in Postgres is what
 * actually decides what the holder can read (ADR-0002).
 */
export async function getStoredUser(): Promise<AuthUser | null> {
  if (!isBackendConfigured) return null;
  try {
    const { data, error } = await getSupabase().auth.getSession();
    if (error || !data.session) return null;
    return toAuthUser(data.session.user);
  } catch {
    // A rejected read (an unreadable keystore, a refresh that throws rather
    // than returning) must still resolve the boot spinner, or the app hangs on
    // it forever. Signed out is the one state the musician can act on.
    return null;
  }
}

/**
 * Fires on sign-in, sign-out, token refresh and session restore.
 *
 * The listener must stay synchronous: awaiting another Supabase call inside
 * this callback deadlocks the auth client, which is a documented footgun and a
 * genuinely baffling hang when it happens.
 */
export function onAuthStateChange(listener: (user: AuthUser | null) => void): () => void {
  if (!isBackendConfigured) return () => {};

  const { data } = getSupabase().auth.onAuthStateChange((_event, session: Session | null) => {
    listener(session ? toAuthUser(session.user) : null);
  });

  return () => data.subscription.unsubscribe();
}

/**
 * Refresh the access token only while the app is in front of the musician.
 *
 * Left running, the timer wakes the app to renew a token nobody is using — on
 * a phone in a gig bag for a four-hour load-in, that is pure battery.
 */
export function startAutoRefresh(): void {
  if (!isBackendConfigured) return;
  void getSupabase().auth.startAutoRefresh();
}

export function stopAutoRefresh(): void {
  if (!isBackendConfigured) return;
  void getSupabase().auth.stopAutoRefresh();
}
