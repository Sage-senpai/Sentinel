'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './LiquidationRadar.module.scss';

interface CascadePrediction {
  probability: number;
  severity: 'WATCH' | 'ALERT' | 'CASCADE_IMMINENT';
  timeHorizon: string;
  affectedRange: { low: number; high: number };
  estimatedVolume: number;
}

interface MarketRisk {
  symbol: string;
  riskScore: number;
  liquidationDensity: number;
}

export function LiquidationRadar() {
  const heatmapRef = useRef<HTMLDivElement>(null);
  const [cascade, setCascade] = useState<CascadePrediction | null>(null);
  const [markets, setMarkets] = useState<MarketRisk[]>([
    { symbol: 'BTC-PERP', riskScore: 42, liquidationDensity: 0.15 },
    { symbol: 'ETH-PERP', riskScore: 67, liquidationDensity: 0.28 },
    { symbol: 'SOL-PERP', riskScore: 23, liquidationDensity: 0.08 },
    { symbol: 'ARB-PERP', riskScore: 55, liquidationDensity: 0.19 },
  ]);
  const [selectedMarket, setSelectedMarket] = useState('BTC-PERP');

  useEffect(() => {
    // D3.js heatmap initialization will go here
    // Will subscribe to WebSocket liquidation events
  }, [selectedMarket]);

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'CASCADE_IMMINENT':
        return styles.cascadeImminent;
      case 'ALERT':
        return styles.alert;
      case 'WATCH':
        return styles.watch;
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      {cascade && cascade.severity === 'CASCADE_IMMINENT' && (
        <div className={styles.cascadeBanner}>
          <span className={styles.cascadeBannerIcon}>!!</span>
          <span>CASCADE IMMINENT — {selectedMarket}</span>
          <span className={styles.cascadeBannerProb}>
            {cascade.probability}%
          </span>
        </div>
      )}

      <div className={styles.layout}>
        <aside className={styles.marketSidebar}>
          <h3 className={styles.sidebarTitle}>Markets</h3>
          {markets.map((market) => (
            <button
              key={market.symbol}
              type="button"
              className={`${styles.marketCard} ${selectedMarket === market.symbol ? styles.selected : ''}`}
              onClick={() => setSelectedMarket(market.symbol)}
            >
              <div
                className={styles.riskOrb}
                data-risk={market.riskScore}
              />
              <div className={styles.marketInfo}>
                <span className={styles.marketSymbol}>{market.symbol}</span>
                <span className={styles.marketRisk}>
                  Risk: {market.riskScore}/100
                </span>
              </div>
            </button>
          ))}
        </aside>

        <div className={styles.main}>
          <div className={styles.heatmapHeader}>
            <h2>Liquidation Heatmap — {selectedMarket}</h2>
            <div className={styles.legend}>
              <span className={styles.legendLow}>Low</span>
              <div className={styles.legendBar} />
              <span className={styles.legendHigh}>Extreme</span>
            </div>
          </div>

          <div className={styles.heatmap} ref={heatmapRef}>
            <div className={styles.heatmapPlaceholder}>
              Connecting to Pacifica WebSocket...
            </div>
          </div>

          <div className={styles.gaugeRow}>
            <div className={styles.gaugeCard}>
              <h4>Cascade Probability</h4>
              <div className={styles.gauge}>
                <svg viewBox="0 0 100 50" className={styles.gaugeSvg}>
                  <path
                    d="M 10 45 A 35 35 0 0 1 90 45"
                    fill="none"
                    stroke="rgba(107, 122, 155, 0.3)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 45 A 35 35 0 0 1 90 45"
                    fill="none"
                    stroke="var(--color-teal)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="110"
                    strokeDashoffset={110 - (110 * (cascade?.probability || 0)) / 100}
                  />
                </svg>
                <span className={styles.gaugeValue}>
                  {cascade?.probability || 0}%
                </span>
              </div>
            </div>

            <div className={styles.gaugeCard}>
              <h4>Mark Price</h4>
              <div className={styles.priceValue}>$—</div>
            </div>

            <div className={styles.gaugeCard}>
              <h4>Liquidation Velocity</h4>
              <div className={styles.priceValue}>0 events/min</div>
            </div>

            <div className={styles.gaugeCard}>
              <h4>Your Liq. Distance</h4>
              <div className={styles.priceValue}>—</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
