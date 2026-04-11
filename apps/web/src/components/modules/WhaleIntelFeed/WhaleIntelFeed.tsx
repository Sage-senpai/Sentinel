'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useApi } from '@/hooks/useApi';
import { useNotify } from '@/components/providers/NotificationProvider';
import * as api from '@/services/api';
import { ProBadge } from '@/components/layout/ProBadge/ProBadge';
import styles from './WhaleIntelFeed.module.scss';

type WhaleIntent = 'ACCUMULATING' | 'DISTRIBUTING' | 'HEDGING' | 'ARBITRAGE' | 'UNKNOWN';

interface WhaleEventUI {
  id: string;
  walletAddress: string;
  actionType: string;
  sizeUsd: number;
  market: string;
  intent: WhaleIntent;
  elfaScore: number;
  createdAt: string;
}

export function WhaleIntelFeed() {
  const [events, setEvents] = useState<WhaleEventUI[]>([]);
  const [convergenceAlert, setConvergenceAlert] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  const { subscribe } = useSocket();
  const { push: notify } = useNotify();
  const prevConvergenceRef = useRef(false);

  // Initial load from API
  const { data: apiEvents } = useApi(() => api.whale.events(), { pollInterval: 30000 });
  const { data: convergenceData } = useApi(() => api.whale.convergence(), { pollInterval: 15000 });

  useEffect(() => {
    if (apiEvents) {
      setEvents(
        apiEvents.map((e) => ({
          id: e.id,
          walletAddress: e.wallet_address,
          actionType: e.action_type,
          sizeUsd: e.size_usd ?? 0,
          market: e.market ?? '',
          intent: (e.intent ?? 'UNKNOWN') as WhaleIntent,
          elfaScore: e.elfa_score ?? 0,
          createdAt: e.created_at,
        }))
      );
    }
  }, [apiEvents]);

  useEffect(() => {
    if (convergenceData && convergenceData.length > 0) {
      if (!prevConvergenceRef.current) {
        notify('whale', 'Smart Money Convergence', `${convergenceData[0].whale_count}+ whales aligned on ${convergenceData[0].market}`, 'whale');
      }
      setConvergenceAlert(true);
      prevConvergenceRef.current = true;
    } else {
      prevConvergenceRef.current = false;
    }
  }, [convergenceData, notify]);

  // Real-time whale events via WebSocket
  useEffect(() => {
    const unsub = subscribe('whale', (raw: unknown) => {
      const event = raw as api.WhaleEvent;
      const uiEvent: WhaleEventUI = {
        id: event.id,
        walletAddress: event.wallet_address,
        actionType: event.action_type,
        sizeUsd: event.size_usd ?? 0,
        market: event.market ?? '',
        intent: (event.intent ?? 'UNKNOWN') as WhaleIntent,
        elfaScore: event.elfa_score ?? 0,
        createdAt: event.created_at,
      };
      setEvents((prev) => [uiEvent, ...prev].slice(0, 50));

      // Notify on large whale events (>$500K)
      if (uiEvent.sizeUsd > 500_000) {
        notify('whale', `Whale ${uiEvent.actionType}`, `${formatUsd(uiEvent.sizeUsd)} on ${uiEvent.market}`, 'whale');
      }
    });
    return unsub;
  }, [subscribe, notify]);

  const toggleWatchlist = (address: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(address)) next.delete(address);
      else next.add(address);
      return next;
    });
  };

  const formatUsd = (value: number): string => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          Whale Intelligence Feed
          <ProBadge feature="Unlimited Whale Alerts" description="Free tier: 3 alerts/day. Pro unlocks unlimited real-time whale tracking with convergence detection." />
        </h2>
        <div className={styles.headerStats}>
          <span className={styles.stat}>
            Tracking: <strong>{events.length}</strong> events
          </span>
          <span className={styles.stat}>
            Watchlist: <strong>{watchlist.size}</strong> wallets
          </span>
        </div>
      </div>

      {convergenceAlert && (
        <div className={styles.convergenceAlert}>
          <span className={styles.convergenceIcon}>!!</span>
          Smart Money Convergence — {convergenceData?.[0]?.whale_count ?? 3}+ whales aligned on {convergenceData?.[0]?.market ?? 'multiple markets'}
        </div>
      )}

      <div className={styles.feed}>
        {events.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Connecting to Elfa AI + Pacifica order flow...</p>
            <p className={styles.emptySubtext}>Whale events will appear here in real-time</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className={styles.whaleCard}>
              <div className={styles.cardHeader}>
                <span className={styles.walletAddress}>
                  {event.walletAddress.slice(0, 6)}...{event.walletAddress.slice(-4)}
                </span>
                <button
                  type="button"
                  className={`${styles.starButton} ${watchlist.has(event.walletAddress) ? styles.starred : ''}`}
                  onClick={() => toggleWatchlist(event.walletAddress)}
                >
                  {watchlist.has(event.walletAddress) ? '\u2605' : '\u2606'}
                </button>
              </div>
              <div className={styles.cardBody}>
                <span className={styles.action}>{event.actionType}</span>
                <span className={styles.size}>{formatUsd(event.sizeUsd)}</span>
                <span className={styles.market}>{event.market}</span>
                <span className={`${styles.intentBadge} ${styles[`intent${event.intent}`]}`}>
                  {event.intent}
                </span>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.elfaScore}>Elfa Score: {event.elfaScore.toFixed(1)}</span>
                <span className={styles.time}>{new Date(event.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
