'use client';

import { createContext, useContext } from 'react';

export interface AuthState {
  authenticated: boolean;
  walletAddress: string | null;
  email: string | null;
  login: () => void;
  logout: () => void;
  ready: boolean;
}

const noop = () => {};

export const AuthContext = createContext<AuthState>({
  authenticated: false,
  walletAddress: null,
  email: null,
  login: noop,
  logout: noop,
  ready: true,
});

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
