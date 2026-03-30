'use client';

import { ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet', 'email', 'google', 'twitter'],
        appearance: {
          theme: 'dark',
          accentColor: '#00B8D9',
          logo: '/sentinel-logo.svg',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: {
          id: 42161,
          name: 'Arbitrum One',
          network: 'arbitrum',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: {
            default: { http: ['https://arb1.arbitrum.io/rpc'] },
            public: { http: ['https://arb1.arbitrum.io/rpc'] },
          },
          blockExplorers: {
            default: { name: 'Arbiscan', url: 'https://arbiscan.io' },
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
