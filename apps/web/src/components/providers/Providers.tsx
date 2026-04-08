'use client';

import { ReactNode, useState, useCallback } from 'react';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { AuthContext, AuthState } from '@/hooks/useAuth';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

function PrivyAuthBridge({ children }: { children: ReactNode }) {
  const privy = usePrivy();
  const { wallets } = useWallets();

  const walletAddress = privy.user?.wallet?.address || wallets?.[0]?.address || null;
  const email = privy.user?.email?.address || null;

  const auth: AuthState = {
    authenticated: privy.authenticated,
    walletAddress,
    email,
    login: privy.login,
    logout: privy.logout,
    ready: privy.ready,
  };

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

function StubAuthBridge({ children }: { children: ReactNode }) {
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

  const auth: AuthState = {
    authenticated,
    walletAddress,
    email: null,
    login,
    logout,
    ready: true,
  };

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  if (!PRIVY_APP_ID) {
    return <StubAuthBridge>{children}</StubAuthBridge>;
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#0066FF',
          logo: '/icons/sentinel-logo.svg',
        },
        loginMethods: ['wallet', 'email', 'google'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <PrivyAuthBridge>{children}</PrivyAuthBridge>
    </PrivyProvider>
  );
}
