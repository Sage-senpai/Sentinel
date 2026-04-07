'use client';

import { useState, useCallback, useContext, createContext } from 'react';

interface AuthState {
  authenticated: boolean;
  walletAddress: string | null;
  email: string | null;
  login: () => void;
  logout: () => void;
  ready: boolean;
}

// This context is set to true by Providers.tsx when PrivyProvider is mounted
export const PrivyMountedContext = createContext(false);

export function useAuth(): AuthState {
  const privyMounted = useContext(PrivyMountedContext);

  if (privyMounted) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return usePrivyAuth();
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useStubAuth();
}

function usePrivyAuth(): AuthState {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { usePrivy, useWallets } = require('@privy-io/react-auth');
  const privy = usePrivy();
  const { wallets } = useWallets();

  const walletAddress = privy.user?.wallet?.address || wallets?.[0]?.address || null;
  const email = privy.user?.email?.address || null;

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
    setWalletAddress('0xDEMO' + Math.random().toString(16).slice(2, 10));
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
