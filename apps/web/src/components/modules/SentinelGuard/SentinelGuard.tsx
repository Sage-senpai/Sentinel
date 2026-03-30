'use client';

import { useState } from 'react';
import styles from './SentinelGuard.module.scss';

interface Position {
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

interface GuardConfig {
  thresholdPct: number;
  actionType: 'partial_close' | 'full_close' | 'add_margin';
  partialClosePct: number;
  maxSpendUsd: number;
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
  const [positions, setPositions] = useState<Position[]>([]);
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configTarget, setConfigTarget] = useState<string | null>(null);
  const [config, setConfig] = useState<GuardConfig>({
    thresholdPct: 15,
    actionType: 'partial_close',
    partialClosePct: 50,
    maxSpendUsd: 500,
  });

  const getHealthColor = (score: number): string => {
    if (score >= 70) return 'var(--color-green)';
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
        <p className={styles.subtitle}>
          Automated position protection — monitors every 10 seconds
        </p>
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
              <p className={styles.emptySubtext}>
                Guard will monitor and protect automatically
              </p>
            </div>
          ) : (
            positions.map((pos) => (
              <div key={pos.symbol} className={styles.positionCard}>
                <div className={styles.posCardHeader}>
                  <div className={styles.posSymbol}>
                    <span
                      className={`${styles.direction} ${styles[pos.direction]}`}
                    >
                      {pos.direction.toUpperCase()}
                    </span>
                    <span>{pos.symbol}</span>
                  </div>
                  <button
                    type="button"
                    className={`${styles.guardToggle} ${pos.guardEnabled ? styles.guardActive : ''}`}
                    onClick={() => {
                      setConfigTarget(pos.symbol);
                      setShowConfigModal(true);
                    }}
                  >
                    {pos.guardEnabled ? 'Guard ON' : 'Guard OFF'}
                  </button>
                </div>

                <div className={styles.posMetrics}>
                  <div className={styles.marginGauge}>
                    <svg viewBox="0 0 100 100" className={styles.gaugeSvg}>
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(107, 122, 155, 0.2)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={getHealthColor(pos.healthScore)}
                        strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset={getMarginArc(pos.marginRatio)}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <span className={styles.marginValue}>
                      {pos.marginRatio.toFixed(1)}%
                    </span>
                  </div>

                  <div className={styles.posStats}>
                    <div className={styles.posStat}>
                      <span className={styles.posLabel}>Entry</span>
                      <span className={styles.posValue}>
                        ${pos.entryPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className={styles.posStat}>
                      <span className={styles.posLabel}>Mark</span>
                      <span className={styles.posValue}>
                        ${pos.markPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className={styles.posStat}>
                      <span className={styles.posLabel}>PnL</span>
                      <span
                        className={`${styles.posValue} ${pos.pnl >= 0 ? styles.positive : styles.negative}`}
                      >
                        {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)} (
                        {pos.pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className={styles.posStat}>
                      <span className={styles.posLabel}>Health</span>
                      <span className={styles.posValue}>
                        {pos.healthScore}/100
                      </span>
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
            <div className={styles.emptyTimeline}>
              No guard actions yet
            </div>
          ) : (
            <div className={styles.timeline}>
              {alerts.map((alert, i) => (
                <div
                  key={alert.id}
                  className={styles.timelineEntry}
                >
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineAction}>
                      {alert.action}
                    </span>
                    <span className={styles.timelineMarket}>
                      {alert.market}
                    </span>
                    <span className={styles.timelineDetails}>
                      {alert.details}
                    </span>
                    <span className={styles.timelineTime}>
                      {alert.timestamp}
                    </span>
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
