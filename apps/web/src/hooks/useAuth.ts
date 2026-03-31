'use client';

import { useState, useCallback } from 'react';

interface AuthState {
  authenticated: boolean;
  walletAddress: string | null;
  email: string | null;
  login: () => void;
  logout: () => void;
}

/**
 * Auth hook — wraps Privy when available, falls back to stub.
 * Full Privy integration wired in Phase 1.
 */
export function useAuth(): AuthState {
  const [authenticated, setAuthenticated] = useState(false);

  const login = useCallback(() => {
    // Phase 1: will call privy.login()
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
  };
}
