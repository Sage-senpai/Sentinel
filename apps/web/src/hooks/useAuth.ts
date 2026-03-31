'use client';

import { useState, useCallback, useMemo } from 'react';

interface AuthState {
  authenticated: boolean;
  walletAddress: string | null;
  email: string | null;
  login: () => void;
  logout: () => void;
  ready: boolean;
}

let privyHook: typeof import('@privy-io/react-auth').usePrivy | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('@privy-io/react-auth');
  privyHook = mod.usePrivy;
} catch {
  // Privy not available — use stub
}

function usePrivyAuth(): AuthState {
  const privy = privyHook!();

  const walletAddress = useMemo(() => {
    return privy.user?.wallet?.address ?? null;
  }, [privy.user?.wallet?.address]);

  const email = useMemo(() => {
    return privy.user?.email?.address ?? null;
  }, [privy.user?.email?.address]);

  return {
    authenticated: privy.authenticated,
    walletAddress,
    email,
    login: privy.login,
    logout: privy.logout,
    ready: privy.ready,
  };
}

function useStubAuth(): AuthState {
  const [authenticated, setAuthenticated] = useState(false);

  const login = useCallback(() => {
    setAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setAuthenticated(false);
  }, []);

  return {
    authenticated,
    walletAddress: null,
    email: null,
    login,
    logout,
    ready: true,
  };
}

export function useAuth(): AuthState {
  const hasPrivyAppId = typeof window !== 'undefined' &&
    !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (hasPrivyAppId && privyHook) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return usePrivyAuth();
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useStubAuth();
}
