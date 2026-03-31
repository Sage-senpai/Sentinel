'use client';

import { ReactNode } from 'react';

/**
 * App providers wrapper.
 * Phase 1: Add PrivyProvider here when NEXT_PUBLIC_PRIVY_APP_ID is set.
 * Phase 2: Add SocketProvider for real-time alerts.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
