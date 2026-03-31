'use client';

import Link from 'next/link';
import {
  SentinelLogo,
  IconRadar,
  IconWhale,
  IconShield,
  IconHedge,
  IconChart,
  IconAgents,
} from '@/components/icons/Icons';
import styles from './Landing.module.scss';

const FEATURES = [
  {
    icon: IconRadar,
    title: 'Liquidation Radar',
    description: 'D3-powered heatmap visualizing liquidation clusters across all markets in real time.',
  },
  {
    icon: IconWhale,
    title: 'Whale Intelligence',
    description: 'Track whale wallets, decode intent patterns, and get smart money convergence alerts.',
  },
  {
    icon: IconShield,
    title: 'SENTINEL Guard',
    description: 'Automated position protection. Set thresholds, and Guard executes before you get liquidated.',
  },
  {
    icon: IconHedge,
    title: 'Africa FX Hedge',
    description: 'Hedge NGN, KES, GHS exposure through BTC perpetuals on Pacifica — built for African traders.',
  },
  {
    icon: IconChart,
    title: 'Funding Rate Intel',
    description: 'ARIMA + LSTM forecasts for funding rates. See 4 epochs ahead with confidence bands.',
  },
  {
    icon: IconAgents,
    title: '6 AI Agents',
    description: 'Background agents running 24/7 — monitoring, predicting, and protecting your capital.',
  },
];

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['3 whale alerts/day', 'Delayed data (30s)', 'Basic radar view'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: [
      'Unlimited whale alerts',
      'Real-time data',
      'SENTINEL Guard bot',
      'Funding forecasts',
      'Africa FX hedge',
    ],
    cta: 'Start Pro',
    highlighted: true,
  },
  {
    name: 'Institutional',
    price: '$499',
    period: '/month',
    features: [
      'Everything in Pro',
      'API access',
      'Custom webhooks',
      'Priority support',
      'White-glove onboarding',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <SentinelLogo size={32} />
            <span className={styles.navBrandName}>SENTINEL</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <Link href="/onboarding" className={styles.navCta}>
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Powered by 6 AI Agents
          </div>
          <h1 className={styles.heroTitle}>
            See the Cascade.
            <br />
            <span className={styles.heroAccent}>Stop the Wipeout.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            AI-powered liquidation defense and whale intelligence for Pacifica traders.
            Detect cascading liquidations before they hit. Protect your positions automatically.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/onboarding" className={styles.ctaPrimary}>
              Get Started Free
            </Link>
            <a href="#features" className={styles.ctaSecondary}>
              Explore Features
            </a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{'<'}500ms</span>
              <span className={styles.heroStatLabel}>Alert Latency</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>24/7</span>
              <span className={styles.heroStatLabel}>Agent Monitoring</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>6</span>
              <span className={styles.heroStatLabel}>AI Agents</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <h2 className={styles.sectionTitle}>Everything You Need</h2>
        <p className={styles.sectionSubtitle}>
          Six specialized modules. Six AI agents. One platform defending your capital.
        </p>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <f.icon size={28} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.pricing} id="pricing">
        <h2 className={styles.sectionTitle}>Simple Pricing</h2>
        <p className={styles.sectionSubtitle}>
          Start free. Upgrade when you need real-time data and automated protection.
        </p>
        <div className={styles.pricingGrid}>
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`${styles.pricingCard} ${tier.highlighted ? styles.pricingHighlighted : ''}`}
            >
              {tier.highlighted && <div className={styles.pricingPopular}>Most Popular</div>}
              <h3>{tier.name}</h3>
              <div className={styles.pricingPrice}>
                <span className={styles.priceAmount}>{tier.price}</span>
                <span className={styles.pricePeriod}>{tier.period}</span>
              </div>
              <ul className={styles.pricingFeatures}>
                {tier.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link
                href="/onboarding"
                className={tier.highlighted ? styles.ctaPrimary : styles.ctaOutline}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <SentinelLogo size={24} />
            <span>SENTINEL</span>
          </div>
          <span className={styles.footerText}>
            Built for the Pacifica Hackathon 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
