'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';

interface AuthState {
  authenticated: boolean;
  walletAddress: string | null;
  email: string | null;
  login: () => void;
  logout: () => void;
  ready: boolean;
}

export function useAuth(): AuthState {
  const hasPrivyAppId = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (hasPrivyAppId) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return usePrivyAuth();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useStubAuth();
}

function usePrivyAuth(): AuthState {
  // Dynamic import at module level — Privy must be installed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { usePrivy, useWallets } = require('@privy-io/react-auth');
  const privy = usePrivy();
  const { wallets } = useWallets();

  const walletAddress = useMemo(() => {
    // Prefer embedded wallet, then external
    if (privy.user?.wallet?.address) return privy.user.wallet.address;
    if (wallets?.[0]?.address) return wallets[0].address;
    return null;
  }, [privy.user?.wallet?.address, wallets]);

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
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const login = useCallback(() => {
    setAuthenticated(true);
    // Generate a demo address for development
    setWalletAddress('0xDEMO' + Math.random().toString(16).slice(2, 10) + '...DEMO');
  }, []);

  const logout = useCallback(() => {
    setAuthenticated(false);
    setWalletAddress(null);
  }, []);

  return {
    authenticated,
    walletAddress,
    email: null,
    login,
    logout,
    ready: true,
  };
}
