'use client';

import { useState, useMemo } from 'react';
import styles from './AfricaHedgeCalculator.module.scss';

type Currency = 'NGN' | 'KES' | 'GHS';

interface FxRate {
  currency: Currency;
  rate: number;
  change24h: number;
  flag: string;
  name: string;
}

interface HedgeResult {
  shortSize: number;
  requiredMargin: number;
  dailyCarry: number;
  dailyCarryLocal: number;
  recommendation: string;
}

const CURRENCIES: FxRate[] = [
  { currency: 'NGN', rate: 0, change24h: 0, flag: '\uD83C\uDDF3\uD83C\uDDEC', name: 'Nigerian Naira' },
  { currency: 'KES', rate: 0, change24h: 0, flag: '\uD83C\uDDF0\uD83C\uDDEA', name: 'Kenyan Shilling' },
  { currency: 'GHS', rate: 0, change24h: 0, flag: '\uD83C\uDDEC\uD83C\uDDED', name: 'Ghanaian Cedi' },
];

export function AfricaHedgeCalculator() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('NGN');
  const [portfolioValue, setPortfolioValue] = useState<string>('');
  const [hedgeRatio, setHedgeRatio] = useState(50);
  const [duration, setDuration] = useState(30);
  const [rates, setRates] = useState<FxRate[]>(CURRENCIES);

  const selectedRate = useMemo(
    () => rates.find((r) => r.currency === selectedCurrency),
    [rates, selectedCurrency],
  );

  const hedgeResult = useMemo((): HedgeResult | null => {
    const valueUsd = parseFloat(portfolioValue);
    if (!valueUsd || !selectedRate?.rate) return null;

    const valueInLocal = valueUsd * selectedRate.rate;
    const hedgeAmount = valueUsd * (hedgeRatio / 100);
    const btcPrice = 65000; // placeholder — will come from API
    const shortSize = hedgeAmount / btcPrice;
    const leverage = 2;
    const requiredMargin = hedgeAmount / leverage;
    const fundingRate = 0.0001; // placeholder — 0.01% per 8h
    const dailyCarry = hedgeAmount * fundingRate * 3;
    const dailyCarryLocal = dailyCarry * selectedRate.rate;

    const recommendation = `Short ${shortSize.toFixed(4)} BTC-PERP at ${leverage}x leverage.\nRequired margin: $${requiredMargin.toFixed(0)} USDC.\nDaily carry: ${dailyCarry >= 0 ? '+' : ''}$${dailyCarry.toFixed(2)} (${dailyCarryLocal >= 0 ? '+' : ''}${selectedRate.currency} ${dailyCarryLocal.toFixed(0)}).`;

    return {
      shortSize,
      requiredMargin,
      dailyCarry,
      dailyCarryLocal,
      recommendation,
    };
  }, [portfolioValue, hedgeRatio, selectedRate]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Africa FX Hedge Calculator</h2>
        <p className={styles.subtitle}>
          Protect portfolio value against local currency depreciation
        </p>
      </div>

      <div className={styles.layout}>
        <div className={styles.inputSection}>
          <div className={styles.currencySelector}>
            <h4>Select Currency</h4>
            <div className={styles.currencyGrid}>
              {rates.map((r) => (
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
                    {r.rate > 0 ? `$1 = ${r.rate.toFixed(2)}` : 'Loading...'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="portfolio-value">
              Portfolio Value (USD)
            </label>
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
            <label className={styles.label} htmlFor="hedge-ratio">
              Hedge Ratio: {hedgeRatio}%
            </label>
            <input
              id="hedge-ratio"
              type="range"
              className={styles.slider}
              min="25"
              max="100"
              step="5"
              value={hedgeRatio}
              onChange={(e) => setHedgeRatio(Number(e.target.value))}
            />
            <div className={styles.sliderLabels}>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="duration">
              Duration (days)
            </label>
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
          {hedgeResult ? (
            <div className={styles.resultCard}>
              <h3>Hedge Recommendation</h3>
              <pre className={styles.recommendation}>
                {hedgeResult.recommendation}
              </pre>

              <div className={styles.resultMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Short Size</span>
                  <span className={styles.metricValue}>
                    {hedgeResult.shortSize.toFixed(4)} BTC
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Required Margin</span>
                  <span className={styles.metricValue}>
                    ${hedgeResult.requiredMargin.toFixed(0)} USDC
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Daily Carry</span>
                  <span
                    className={`${styles.metricValue} ${hedgeResult.dailyCarry >= 0 ? styles.positive : styles.negative}`}
                  >
                    {hedgeResult.dailyCarry >= 0 ? '+' : ''}$
                    {hedgeResult.dailyCarry.toFixed(2)}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>
                    Total Cost ({duration}d)
                  </span>
                  <span className={styles.metricValue}>
                    ${Math.abs(hedgeResult.dailyCarry * duration).toFixed(2)}
                  </span>
                </div>
              </div>

              <button type="button" className={styles.ctaButton}>
                Open this hedge on Pacifica
              </button>
            </div>
          ) : (
            <div className={styles.resultEmpty}>
              <p>Enter portfolio value to see hedge recommendation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
