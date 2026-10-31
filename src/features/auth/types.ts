/**
 * The auth slice's domain types.
 *
 * Nothing here is shaped like a Supabase response: repositories map at the
 * boundary (docs/tech/33-conventions.md) so that swapping the method — password
 * today, email OTP later (ADR-0008) — or the provider entirely never reaches a
 * screen.
 */

/** A signed-in person, as the rest of the app needs to know them. */
export type AuthUser = {
  id: string;
  email: string;
};

/** `profiles`, mapped out of snake_case. Mirrors docs/product/13-domain-model.md. */
export type Profile = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  plan: 'free_unlimited' | 'free' | 'pro';
};

/**
 * Why a sign-in did not happen.
 *
 * `invalidCredentials` deliberately covers "no such account" as well as "wrong
 * password". Distinguishing them turns the sign-in screen into an oracle for
 * which email addresses have Jamly accounts, which is a privacy leak with no
 * upside — the musician who typo'd their email is helped by neither answer.
 */
export type AuthFailureReason =
  | 'invalidCredentials'
  | 'emailNotConfirmed'
  | 'accountBlocked'
  | 'tooManyAttempts'
  | 'offline'
  | 'backendUnconfigured'
  | 'unknown';

export type AuthFailure = {
  reason: AuthFailureReason;
  /** Shown to the user. Musicians' language, never an error code. */
  message: string;
};

/** Repositories never throw at a screen: every call resolves to one of these. */
export type SignInResult = { ok: true; user: AuthUser } | { ok: false; failure: AuthFailure };
