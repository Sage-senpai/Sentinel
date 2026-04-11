'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useApi } from '@/hooks/useApi';
import * as api from '@/services/api';
import { ProBadge } from '@/components/layout/ProBadge/ProBadge';
import styles from './FundingRateDashboard.module.scss';

interface FundingRateUI {
  market: string;
  rate8h: number;
  annualizedApr: number;
  predicted: number[];
  trend: 'rising' | 'falling' | 'stable';
}

interface PositionCarry {
  symbol: string;
  direction: 'long' | 'short';
  size: number;
  carryPerEpoch: number;
  carryPerDay: number;
}

export function FundingRateDashboard() {
  const [rates, setRates] = useState<FundingRateUI[]>([]);
  const [carries] = useState<PositionCarry[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  const { subscribe } = useSocket();

  const { data: apiRates } = useApi(() => api.funding.rates(), { pollInterval: 30000 });
  const { data: forecast } = useApi(
    () => selectedMarket ? api.funding.forecast(selectedMarket) : Promise.resolve(null),
    { pollInterval: 60000, enabled: !!selectedMarket }
  );

  useEffect(() => {
    if (apiRates) {
      setRates(apiRates.map((r: api.FundingRate & { next_funding_rate?: number }) => {
        const apr = r.annualized_apr;
        const nextRate = (r as { next_funding_rate?: number }).next_funding_rate;
        let trend: 'rising' | 'falling' | 'stable' = 'stable';
        if (apr > 5) trend = 'rising';
        else if (apr < -5) trend = 'falling';

        const predictions = forecast?.symbol === r.market
          ? forecast.predictions
          : nextRate != null ? [nextRate] : [];

        return {
          market: r.market,
          rate8h: r.rate_8h,
          annualizedApr: apr,
          predicted: predictions,
          trend,
        };
      }));
    }
  }, [apiRates, forecast]);

  // Real-time funding updates
  useEffect(() => {
    const unsub = subscribe('funding', (raw: unknown) => {
      const event = raw as { symbol: string; rate: number; markPrice: number };
      setRates((prev) =>
        prev.map((r) =>
          r.market === event.symbol
            ? { ...r, rate8h: event.rate, annualizedApr: event.rate * 3 * 365 * 100 }
            : r
        )
      );
    });
    return unsub;
  }, [subscribe]);

  const formatRate = (rate: number): string => {
    const sign = rate >= 0 ? '+' : '';
    return `${sign}${(rate * 100).toFixed(4)}%`;
  };

  const formatApr = (apr: number): string => {
    const sign = apr >= 0 ? '+' : '';
    return `${sign}${apr.toFixed(2)}%`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          Funding Rate Intelligence
          <ProBadge feature="Funding Forecasts" description="ARIMA+LSTM ensemble model predicts 4 epochs ahead with confidence bands. Spot carry opportunities before the market." />
        </h2>
        <p className={styles.subtitle}>Live rates, 4-epoch forecast, and carry cost analysis</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.tableSection}>
          <h3>Live Funding Rates</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Market</th>
                  <th>8h Rate</th>
                  <th>Annualized APR</th>
                  <th>Trend</th>
                  <th>Next Predicted</th>
                </tr>
              </thead>
              <tbody>
                {rates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyRow}>Loading funding rates from Pacifica...</td>
                  </tr>
                ) : (
                  rates.map((r) => (
                    <tr
                      key={r.market}
                      className={`${styles.row} ${selectedMarket === r.market ? styles.selectedRow : ''}`}
                      onClick={() => setSelectedMarket(r.market)}
                    >
                      <td className={styles.marketCell}>{r.market}</td>
                      <td className={`${styles.rateCell} ${r.rate8h >= 0 ? styles.positive : styles.negative}`}>
                        {formatRate(r.rate8h)}
                      </td>
                      <td className={`${styles.aprCell} ${r.annualizedApr >= 0 ? styles.positive : styles.negative}`}>
                        {formatApr(r.annualizedApr)}
                      </td>
                      <td className={styles.trendCell}>
                        <span className={styles[r.trend]}>
                          {r.trend === 'rising' ? '\u2191' : r.trend === 'falling' ? '\u2193' : '\u2192'}
                        </span>
                      </td>
                      <td className={styles.rateCell}>
                        {r.predicted[0] ? formatRate(r.predicted[0]) : '--'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.chartSection}>
          <h3>
            {selectedMarket ? `${selectedMarket} — Funding Rate Forecast` : 'Select a market to view forecast'}
          </h3>
          {selectedMarket && forecast ? (
            <div className={styles.chartContainer}>
              <svg viewBox="0 0 600 200" className={styles.chartSvg} preserveAspectRatio="none">
                {/* Zero line */}
                <line x1="50" y1="100" x2="550" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="4,4" />
                <text x="10" y="104" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="var(--font-mono)">0%</text>

                {/* Confidence band */}
                {forecast.predictions.length > 0 && (
                  <path
                    d={`M ${forecast.confidence_upper.map((v, i) => `${50 + i * (500 / (forecast.predictions.length - 1 || 1))},${100 - v * 100000}`).join(' L ')} L ${forecast.confidence_lower.slice().reverse().map((v, i) => `${50 + (forecast.predictions.length - 1 - i) * (500 / (forecast.predictions.length - 1 || 1))},${100 - v * 100000}`).join(' L ')} Z`}
                    fill="rgba(0, 102, 255, 0.1)"
                    stroke="none"
                  />
                )}

                {/* Prediction line */}
                {forecast.predictions.length > 0 && (
                  <polyline
                    points={forecast.predictions.map((v, i) => `${50 + i * (500 / (forecast.predictions.length - 1 || 1))},${100 - v * 100000}`).join(' ')}
                    fill="none"
                    stroke="var(--color-blue)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Prediction dots */}
                {forecast.predictions.map((v, i) => (
                  <circle
                    key={i}
                    cx={50 + i * (500 / (forecast.predictions.length - 1 || 1))}
                    cy={100 - v * 100000}
                    r="4"
                    fill="var(--color-blue)"
                    stroke="var(--color-base)"
                    strokeWidth="2"
                  />
                ))}

                {/* Epoch labels */}
                {forecast.predictions.map((v, i) => (
                  <text
                    key={`label-${i}`}
                    x={50 + i * (500 / (forecast.predictions.length - 1 || 1))}
                    y="190"
                    fill="rgba(255,255,255,0.4)"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                  >
                    Epoch {i + 1}
                  </text>
                ))}

                {/* Rate labels on dots */}
                {forecast.predictions.map((v, i) => (
                  <text
                    key={`rate-${i}`}
                    x={50 + i * (500 / (forecast.predictions.length - 1 || 1))}
                    y={95 - v * 100000}
                    fill="var(--color-text-primary)"
                    fontSize="8"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                  >
                    {(v * 100).toFixed(4)}%
                  </text>
                ))}
              </svg>
            </div>
          ) : (
            <div className={styles.chartPlaceholder}>
              Click a market row to view predicted funding rates
            </div>
          )}
        </div>

        {carries.length > 0 && (
          <div className={styles.carrySection}>
            <h3>Your Position Carry Costs</h3>
            <div className={styles.carryGrid}>
              {carries.map((c) => (
                <div key={c.symbol} className={styles.carryCard}>
                  <div className={styles.carrySymbol}>{c.symbol}</div>
                  <div className={styles.carryMetrics}>
                    <div className={styles.carryMetric}>
                      <span className={styles.carryLabel}>Per Epoch (8h)</span>
                      <span className={`${styles.carryValue} ${c.carryPerEpoch >= 0 ? styles.positive : styles.negative}`}>
                        {c.carryPerEpoch >= 0 ? '+' : ''}${c.carryPerEpoch.toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.carryMetric}>
                      <span className={styles.carryLabel}>Per Day</span>
                      <span className={`${styles.carryValue} ${c.carryPerDay >= 0 ? styles.positive : styles.negative}`}>
                        {c.carryPerDay >= 0 ? '+' : ''}${c.carryPerDay.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
