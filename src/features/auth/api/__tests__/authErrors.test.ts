/**
 * Mapping is where a security property is either kept or quietly lost: a
 * message that distinguishes "no such account" from "wrong password" turns the
 * sign-in screen into a way to enumerate who has a Jamly account. These cases
 * pin that, and pin the shapes GoTrue actually returns.
 */

import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';

import { toAuthFailure } from '../authErrors';

describe('toAuthFailure', () => {
  it('gives a wrong password and an unknown account the same answer', () => {
    const wrongPassword = toAuthFailure(
      new AuthApiError('Invalid login credentials', 400, 'invalid_credentials'),
    );
    const noSuchAccount = toAuthFailure(
      new AuthApiError('User not found', 400, 'user_not_found'),
    );

    expect(wrongPassword.reason).toBe('invalidCredentials');
    expect(noSuchAccount).toEqual(wrongPassword);
  });

  it('recognises old GoTrue responses that carry no code', () => {
    const failure = toAuthFailure(
      new AuthApiError('Invalid login credentials', 400, undefined),
    );

    expect(failure.reason).toBe('invalidCredentials');
  });

  it('blames the connection, not the password, when the request never lands', () => {
    expect(toAuthFailure(new AuthRetryableFetchError('Network error', 0)).reason).toBe(
      'offline',
    );
    expect(toAuthFailure(new TypeError('Network request failed')).reason).toBe('offline');
  });

  it('reads a bare 429 from the edge as rate limiting, code or no code', () => {
    expect(toAuthFailure(new AuthApiError('Too many requests', 429, undefined)).reason).toBe(
      'tooManyAttempts',
    );
    expect(
      toAuthFailure(new AuthApiError('rate limited', 400, 'over_request_rate_limit')).reason,
    ).toBe('tooManyAttempts');
  });

  it('keeps confirmation and lockout distinguishable — both are actionable', () => {
    expect(
      toAuthFailure(new AuthApiError('Email not confirmed', 400, 'email_not_confirmed')).reason,
    ).toBe('emailNotConfirmed');
    expect(toAuthFailure(new AuthApiError('User is banned', 403, 'user_banned')).reason).toBe(
      'accountBlocked',
    );
  });

  it('falls back to something a person can read', () => {
    const failure = toAuthFailure({ weird: true });

    expect(failure.reason).toBe('unknown');
    expect(failure.message).not.toMatch(/[a-z]+_[a-z]+/);
  });
});
