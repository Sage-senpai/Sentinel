'use client';

import { useState } from 'react';
import styles from './WhaleIntelFeed.module.scss';

type WhaleIntent =
  | 'ACCUMULATING'
  | 'DISTRIBUTING'
  | 'HEDGING'
  | 'ARBITRAGE'
  | 'UNKNOWN';

interface WhaleEvent {
  id: string;
  walletAddress: string;
  actionType: string;
  sizeUsd: number;
  market: string;
  intent: WhaleIntent;
  elfaScore: number;
  createdAt: string;
  isStarred: boolean;
}

export function WhaleIntelFeed() {
  const [events, setEvents] = useState<WhaleEvent[]>([]);
  const [convergenceAlert, setConvergenceAlert] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  const toggleWatchlist = (address: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(address)) {
        next.delete(address);
      } else {
        next.add(address);
      }
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
        <h2>Whale Intelligence Feed</h2>
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
          Smart Money Convergence — 3+ whales aligned on same direction
        </div>
      )}

      <div className={styles.feed}>
        {events.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Connecting to Elfa AI + Pacifica order flow...</p>
            <p className={styles.emptySubtext}>
              Whale events will appear here in real-time
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className={styles.whaleCard}>
              <div className={styles.cardHeader}>
                <span className={styles.walletAddress}>
                  {event.walletAddress.slice(0, 6)}...
                  {event.walletAddress.slice(-4)}
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
                <span
                  className={`${styles.intentBadge} ${styles[`intent${event.intent}`]}`}
                >
                  {event.intent}
                </span>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.elfaScore}>
                  Elfa Score: {event.elfaScore.toFixed(1)}
                </span>
                <span className={styles.time}>{event.createdAt}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
