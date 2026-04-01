'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useApi } from '@/hooks/useApi';
import * as api from '@/services/api';
import styles from './SentinelGuard.module.scss';

interface PositionUI {
  symbol: string;
  direction: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  marginRatio: number;
  healthScore: number;
  guardEnabled: boolean;
  pnl: number;
  pnlPercent: number;
}

interface AlertEntry {
  id: string;
  timestamp: string;
  action: string;
  market: string;
  details: string;
  status: 'success' | 'failed' | 'pending';
}

export function SentinelGuard() {
  const [positions, setPositions] = useState<PositionUI[]>([]);
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [guardConfig, setGuardConfig] = useState<api.GuardConfig | null>(null);

  const { subscribe } = useSocket();

  // Fetch positions
  const { data: apiPositions } = useApi(() => api.positions.open(), { pollInterval: 10000 });
  const { data: apiConfig } = useApi(() => api.guard.config());
  const { data: apiAlerts } = useApi(() => api.alerts.recent(), { pollInterval: 15000 });

  useEffect(() => {
    if (apiPositions) {
      setPositions(apiPositions.map((p) => ({
        symbol: p.symbol,
        direction: p.direction as 'long' | 'short',
        size: p.size,
        entryPrice: p.entry_price,
        markPrice: p.mark_price,
        marginRatio: p.margin_ratio,
        healthScore: p.health_score,
        guardEnabled: guardConfig?.guard_enabled ?? false,
        pnl: p.unrealized_pnl,
        pnlPercent: p.entry_price > 0 ? (p.unrealized_pnl / (p.size * p.entry_price)) * 100 : 0,
      })));
    }
  }, [apiPositions, guardConfig]);

  useEffect(() => {
    if (apiConfig) setGuardConfig(apiConfig);
  }, [apiConfig]);

  useEffect(() => {
    if (apiAlerts) {
      setAlerts(
        apiAlerts.filter((a) => a.module === 'guard').map((a) => ({
          id: a.id,
          timestamp: new Date(a.created_at).toLocaleTimeString(),
          action: a.action_taken ?? 'Guard Action',
          market: a.market ?? '',
          details: `Severity: ${a.severity ?? 'N/A'}`,
          status: 'success' as const,
        }))
      );
    }
  }, [apiAlerts]);

  // Real-time position updates
  useEffect(() => {
    const unsub = subscribe('guard', (raw: unknown) => {
      const event = raw as { symbol: string; margin_ratio: number; mark_price: number; health_score: number };
      setPositions((prev) =>
        prev.map((p) =>
          p.symbol === event.symbol
            ? { ...p, marginRatio: event.margin_ratio, markPrice: event.mark_price, healthScore: event.health_score }
            : p
        )
      );
    });
    return unsub;
  }, [subscribe]);

  const toggleGuard = useCallback(async (symbol: string) => {
    setPositions((prev) =>
      prev.map((p) => p.symbol === symbol ? { ...p, guardEnabled: !p.guardEnabled } : p)
    );
    try {
      await api.guard.update({ guard_enabled: !guardConfig?.guard_enabled, position_symbol: symbol });
    } catch {
      // Revert on failure
      setPositions((prev) =>
        prev.map((p) => p.symbol === symbol ? { ...p, guardEnabled: !p.guardEnabled } : p)
      );
    }
  }, [guardConfig]);

  const getHealthColor = (score: number): string => {
    if (score >= 70) return 'var(--color-teal)';
    if (score >= 40) return 'var(--color-gold)';
    return 'var(--color-red)';
  };

  const getMarginArc = (ratio: number): number => {
    const maxArc = 283;
    return maxArc - (maxArc * Math.min(ratio, 100)) / 100;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>SENTINEL Guard</h2>
        <p className={styles.subtitle}>Automated position protection — monitors every 10 seconds</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.positionsSection}>
          <h3>Open Positions</h3>
          {positions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.shieldIcon}>
                <span className={styles.shieldGlyph}>{'\u25C6'}</span>
              </div>
              <p>Connect wallet to view Pacifica positions</p>
              <p className={styles.emptySubtext}>Guard will monitor and protect automatically</p>
            </div>
          ) : (
            positions.map((pos) => (
              <div key={pos.symbol} className={styles.positionCard}>
                <div className={styles.posCardHeader}>
                  <div className={styles.posSymbol}>
                    <span className={`${styles.direction} ${styles[pos.direction]}`}>
                      {pos.direction.toUpperCase()}
                    </span>
                    <span>{pos.symbol}</span>
                  </div>
                  <button
                    type="button"
                    className={`${styles.guardToggle} ${pos.guardEnabled ? styles.guardActive : ''}`}
                    onClick={() => toggleGuard(pos.symbol)}
                  >
                    {pos.guardEnabled ? 'Guard ON' : 'Guard OFF'}
                  </button>
                </div>

                <div className={styles.posMetrics}>
                  <div className={styles.marginGauge}>
                    <svg viewBox="0 0 100 100" className={styles.gaugeSvg}>
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="45" fill="none"
                        stroke={getHealthColor(pos.healthScore)}
                        strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset={getMarginArc(pos.marginRatio)}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                      />
                    </svg>
                    <span className={styles.marginValue}>{pos.marginRatio.toFixed(1)}%</span>
                  </div>

                  <div className={styles.posStats}>
                    <div className={styles.posStat}>
                      <span className={styles.posLabel}>Entry</span>
                      <span className={styles.posValue}>${pos.entryPrice.toLocaleString()}</span>
                    </div>
                    <div className={styles.posStat}>
                      <span className={styles.posLabel}>Mark</span>
                      <span className={styles.posValue}>${pos.markPrice.toLocaleString()}</span>
                    </div>
                    <div className={styles.posStat}>
                      <span className={styles.posLabel}>PnL</span>
                      <span className={`${styles.posValue} ${pos.pnl >= 0 ? styles.positive : styles.negative}`}>
                        {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)} ({pos.pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className={styles.posStat}>
                      <span className={styles.posLabel}>Health</span>
                      <span className={styles.posValue}>{pos.healthScore}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.timelineSection}>
          <h3>Alert Timeline</h3>
          {alerts.length === 0 ? (
            <div className={styles.emptyTimeline}>No guard actions yet</div>
          ) : (
            <div className={styles.timeline}>
              {alerts.map((alert) => (
                <div key={alert.id} className={styles.timelineEntry}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineAction}>{alert.action}</span>
                    <span className={styles.timelineMarket}>{alert.market}</span>
                    <span className={styles.timelineDetails}>{alert.details}</span>
                    <span className={styles.timelineTime}>{alert.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
