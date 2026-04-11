'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import * as api from '@/services/api';
import { ProBadge } from '@/components/layout/ProBadge/ProBadge';
import styles from './AfricaHedgeCalculator.module.scss';

type Currency = 'NGN' | 'ZAR' | 'INR' | 'PHP' | 'IDR' | 'THB';

interface CurrencyMeta {
  currency: Currency;
  rate: number;
  change24h: number;
  flag: string;
  name: string;
  region: string;
}

const DEFAULT_CURRENCIES: CurrencyMeta[] = [
  { currency: 'NGN', rate: 0, change24h: 0, flag: 'NG', name: 'Nigerian Naira', region: 'Africa' },
  { currency: 'ZAR', rate: 0, change24h: 0, flag: 'ZA', name: 'South African Rand', region: 'Africa' },
  { currency: 'INR', rate: 0, change24h: 0, flag: 'IN', name: 'Indian Rupee', region: 'Asia' },
  { currency: 'PHP', rate: 0, change24h: 0, flag: 'PH', name: 'Philippine Peso', region: 'Asia' },
  { currency: 'IDR', rate: 0, change24h: 0, flag: 'ID', name: 'Indonesian Rupiah', region: 'Asia' },
  { currency: 'THB', rate: 0, change24h: 0, flag: 'TH', name: 'Thai Baht', region: 'Asia' },
];

export function AfricaHedgeCalculator() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('NGN');
  const [portfolioValue, setPortfolioValue] = useState<string>('');
  const [hedgeRatio, setHedgeRatio] = useState(50);
  const [duration, setDuration] = useState(30);
  const [rates, setRates] = useState<CurrencyMeta[]>(DEFAULT_CURRENCIES);
  const [apiHedge, setApiHedge] = useState<api.HedgeResult | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  const { data: fxRates } = useApi(() => api.hedge.rates(), { pollInterval: 60000 });

  useEffect(() => {
    if (fxRates) {
      setRates((prev) =>
        prev.map((c) => {
          const live = fxRates.find((f) => f.currency === c.currency);
          return live
            ? { ...c, rate: live.rate_to_usd, change24h: live.change_24h }
            : c;
        })
      );
      // Check data source from raw API response
      setDataSource(fxRates.length > 0 ? 'live' : 'demo');
    }
  }, [fxRates]);

  const selectedRate = useMemo(
    () => rates.find((r) => r.currency === selectedCurrency),
    [rates, selectedCurrency],
  );

  const calculateHedge = useCallback(async () => {
    const valueUsd = parseFloat(portfolioValue);
    if (!valueUsd || valueUsd <= 0) { setApiHedge(null); return; }

    try {
      const result = await api.hedge.calculate({
        currency: selectedCurrency,
        portfolio_value_usd: valueUsd,
        hedge_ratio: hedgeRatio,
        duration_days: duration,
      });
      setApiHedge(result);
    } catch {
      setApiHedge(null);
    }
  }, [portfolioValue, selectedCurrency, hedgeRatio, duration]);

  useEffect(() => {
    const timeout = setTimeout(calculateHedge, 500);
    return () => clearTimeout(timeout);
  }, [calculateHedge]);

  // Local fallback
  const localResult = useMemo(() => {
    const valueUsd = parseFloat(portfolioValue);
    if (!valueUsd || !selectedRate) return null;

    const hedgeAmount = valueUsd * (hedgeRatio / 100);
    const btcPrice = 71000;
    const shortSize = hedgeAmount / btcPrice;
    const requiredMargin = hedgeAmount / 2;
    const dailyCarry = hedgeAmount * 0.000015 * 3;
    const dailyCarryLocal = selectedRate.rate > 0 ? dailyCarry * selectedRate.rate : 0;
    const totalCost = dailyCarry * duration;

    return {
      shortSize,
      requiredMargin,
      dailyCarry,
      dailyCarryLocal,
      totalCost,
      recommendation: `Short ${shortSize.toFixed(4)} BTC on Pacifica at 2x leverage.\nRequired margin: $${requiredMargin.toFixed(0)} USDC\nDaily carry: $${dailyCarry.toFixed(4)}\nTotal cost (${duration}d): $${totalCost.toFixed(2)}`,
    };
  }, [portfolioValue, hedgeRatio, duration, selectedRate]);

  const hedge = apiHedge ? {
    shortSize: apiHedge.short_size_btc,
    requiredMargin: apiHedge.required_margin_usd,
    dailyCarry: apiHedge.daily_carry_usd,
    dailyCarryLocal: apiHedge.daily_carry_local,
    totalCost: (apiHedge as { total_cost_usd?: number }).total_cost_usd ?? apiHedge.daily_carry_usd * duration,
    recommendation: apiHedge.recommendation,
  } : localResult;

  const africaCurrencies = rates.filter((r) => r.region === 'Africa');
  const asiaCurrencies = rates.filter((r) => r.region === 'Asia');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          FX Hedge Calculator
          <ProBadge feature="FX Hedge Calculator" description="Live CoinGecko rates and Pacifica funding data for hedging emerging market currency exposure through BTC perpetuals." />
        </h2>
        <p className={styles.subtitle}>Protect portfolio value against local currency depreciation — Africa & Asia</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.inputSection}>
          <div className={styles.currencySelector}>
            <h4>Africa</h4>
            <div className={styles.currencyGrid}>
              {africaCurrencies.map((r) => (
                <button
                  key={r.currency}
                  type="button"
                  className={`${styles.currencyCard} ${selectedCurrency === r.currency ? styles.selectedCurrency : ''}`}
                  onClick={() => setSelectedCurrency(r.currency)}
                >
                  <span className={styles.flag}>{r.flag}</span>
                  <span className={styles.currencyCode}>{r.currency}</span>
                  <span className={styles.currencyName}>{r.name}</span>
                  <span className={styles.fxRate}>
                    {r.rate > 0 ? `$1 = ${r.rate.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : 'Loading...'}
                  </span>
                </button>
              ))}
            </div>

            <h4>Asia</h4>
            <div className={styles.currencyGrid}>
              {asiaCurrencies.map((r) => (
                <button
                  key={r.currency}
                  type="button"
                  className={`${styles.currencyCard} ${selectedCurrency === r.currency ? styles.selectedCurrency : ''}`}
                  onClick={() => setSelectedCurrency(r.currency)}
                >
                  <span className={styles.flag}>{r.flag}</span>
                  <span className={styles.currencyCode}>{r.currency}</span>
                  <span className={styles.currencyName}>{r.name}</span>
                  <span className={styles.fxRate}>
                    {r.rate > 0 ? `$1 = ${r.rate.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : 'Loading...'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="portfolio-value">Portfolio Value (USD)</label>
            <input
              id="portfolio-value"
              type="number"
              className={styles.input}
              placeholder="e.g. 50000"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="hedge-ratio">Hedge Ratio: {hedgeRatio}%</label>
            <input
              id="hedge-ratio"
              type="range"
              className={styles.slider}
              min="25" max="100" step="5"
              value={hedgeRatio}
              onChange={(e) => setHedgeRatio(Number(e.target.value))}
            />
            <div className={styles.sliderLabels}>
              <span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="duration">Duration (days)</label>
            <input
              id="duration"
              type="number"
              className={styles.input}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        </div>

        <div className={styles.resultSection}>
          {hedge ? (
            <div className={styles.resultCard}>
              <h3>Hedge Recommendation</h3>
              {dataSource && (
                <span className={styles.sourceBadge}>
                  {dataSource === 'live' ? 'LIVE' : 'DEMO'}
                </span>
              )}
              <pre className={styles.recommendation}>{hedge.recommendation}</pre>
              <div className={styles.resultMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Short Size</span>
                  <span className={styles.metricValue}>{hedge.shortSize.toFixed(4)} BTC</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Required Margin</span>
                  <span className={styles.metricValue}>${hedge.requiredMargin.toLocaleString()} USDC</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Daily Carry</span>
                  <span className={`${styles.metricValue} ${hedge.dailyCarry >= 0 ? styles.positive : styles.negative}`}>
                    +${hedge.dailyCarry.toFixed(4)}
                    {hedge.dailyCarryLocal > 0 && ` (${hedge.dailyCarryLocal.toLocaleString()} ${selectedCurrency})`}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Total Cost ({duration}d)</span>
                  <span className={styles.metricValue}>${hedge.totalCost.toFixed(2)}</span>
                </div>
              </div>
              <a
                href="https://test-app.pacifica.fi/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaButton}
              >
                Open this hedge on Pacifica
              </a>
            </div>
          ) : (
            <div className={styles.resultEmpty}>
              <p>Enter a portfolio value to calculate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
