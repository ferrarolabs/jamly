import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import {
  getStoredUser,
  onAuthStateChange,
  signOut as signOutRemote,
  startAutoRefresh,
  stopAutoRefresh,
} from './api/auth.repo';
import type { AuthUser } from './types';

/**
 * Who is using the app, for the whole app.
 *
 * A React context rather than a store: this is the one piece of state every
 * screen needs and nothing but auth ever writes, and adding a state library
 * for a single value would be a dependency the stack document does not justify
 * (docs/tech/31-stack.md).
 */

export type AuthState =
  /** Reading the keystore. Lasts a few milliseconds and must not flash a screen. */
  { status: 'restoring' } | { status: 'signedOut' } | { status: 'signedIn'; user: AuthUser };

type AuthContextValue = {
  state: AuthState;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'restoring' });
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;

    // Subscribed before the stored session is read, so a sign-in completing
    // during the read is observed rather than raced past.
    const unsubscribe = onAuthStateChange((user) => {
      if (!active) return;
      setState(user ? { status: 'signedIn', user } : { status: 'signedOut' });
      if (!user) {
        // Every cached query was fetched under the old identity. On a shared
        // tablet, leaving them would show one band's dates to the next person
        // to sign in.
        queryClient.clear();
      }
    });

    void getStoredUser().then((user) => {
      if (!active) return;
      // Only resolves the initial unknown: a real event that already landed
      // is newer than this read and wins.
      setState((current) =>
        current.status === 'restoring'
          ? user
            ? { status: 'signedIn', user }
            : { status: 'signedOut' }
          : current,
      );
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [queryClient]);

  // The refresh timer runs only while signed in and only in the foreground.
  useEffect(() => {
    if (state.status !== 'signedIn') return;

    startAutoRefresh();
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') startAutoRefresh();
      else stopAutoRefresh();
    });

    return () => {
      subscription.remove();
      stopAutoRefresh();
    };
  }, [state.status]);

  const signOut = useCallback(async () => {
    await signOutRemote();
    // Not waiting for the auth event: sign-out is the one action where the UI
    // must be believed immediately, even if the network never answers.
    setState({ status: 'signedOut' });
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => ({ state, signOut }), [state, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>.');
  return value;
}

/** The signed-in user, or null. For screens that only need the identity. */
export function useAuthUser(): AuthUser | null {
  const { state } = useAuth();
  return state.status === 'signedIn' ? state.user : null;
}
