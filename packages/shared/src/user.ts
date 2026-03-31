// ============================================================
//  User types
// ============================================================

export type UserTier = 'free' | 'pro' | 'institutional';

export interface User {
  id: string;
  privyId: string;
  walletAddress?: string;
  tier: UserTier;
  points: number;
  homeModule: string;
  createdAt: string;
}

export interface TierLimits {
  tier: UserTier;
  realtimeData: boolean;
  maxWhaleAlerts: number;
  guardBotEnabled: boolean;
  apiAccess: boolean;
  webhooks: boolean;
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    tier: 'free',
    realtimeData: false,
    maxWhaleAlerts: 3,
    guardBotEnabled: false,
    apiAccess: false,
    webhooks: false,
  },
  pro: {
    tier: 'pro',
    realtimeData: true,
    maxWhaleAlerts: Infinity,
    guardBotEnabled: true,
    apiAccess: false,
    webhooks: false,
  },
  institutional: {
    tier: 'institutional',
    realtimeData: true,
    maxWhaleAlerts: Infinity,
    guardBotEnabled: true,
    apiAccess: true,
    webhooks: true,
  },
};
