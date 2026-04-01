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
    description: 'D3-powered heatmap visualizing liquidation clusters across all markets. See cascades forming before they trigger.',
  },
  {
    icon: IconWhale,
    title: 'Whale Intelligence',
    description: 'Track whale wallets, decode intent (accumulating, distributing, hedging), and get convergence alerts when smart money aligns.',
  },
  {
    icon: IconShield,
    title: 'SENTINEL Guard',
    description: 'Automated position protection. Set thresholds, and Guard acts before you get liquidated — partial close, full close, or add margin.',
  },
  {
    icon: IconHedge,
    title: 'Africa FX Hedge',
    description: 'Hedge NGN, KES, GHS exposure through BTC perpetuals on Pacifica. Purpose-built for African traders and businesses.',
  },
  {
    icon: IconChart,
    title: 'Funding Rate Intel',
    description: 'ARIMA + LSTM ensemble forecasts 4 epochs ahead. Spot carry opportunities and avoid funding rate surprises.',
  },
  {
    icon: IconAgents,
    title: '6 AI Agents',
    description: 'Background agents running 24/7 — monitoring positions, predicting cascades, tracking whales, and protecting your capital.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Connect Your Wallet',
    description: 'Sign in with your wallet, email, or Google via Privy. SENTINEL creates an embedded wallet if you don\'t have one.',
  },
  {
    step: '02',
    title: 'Agents Start Monitoring',
    description: '6 AI agents spin up instantly — scanning liquidation clusters, tracking whales, and monitoring your positions every 10 seconds.',
  },
  {
    step: '03',
    title: 'Get Alerts, Stay Protected',
    description: 'Receive real-time alerts on cascade events. Guard bot auto-executes protective orders before liquidation hits.',
  },
];

const STATS = [
  { value: '<500ms', label: 'Alert Latency' },
  { value: '10s', label: 'Guard Scan Interval' },
  { value: '6', label: 'AI Agents' },
  { value: '85%+', label: 'Cascade Detection' },
  { value: '3', label: 'African Currencies' },
  { value: '24/7', label: 'Monitoring' },
];

const SPONSORS = [
  { name: 'Pacifica', role: 'Core Exchange' },
  { name: 'Privy', role: 'Auth & Wallets' },
  { name: 'Elfa AI', role: 'Whale Intelligence' },
  { name: 'Fuul', role: 'Referral Engine' },
  { name: 'Rhino.fi', role: 'Cross-Chain Bridge' },
  { name: 'Arbitrum', role: 'On-Chain Alerts' },
];

const FAQ = [
  {
    q: 'What is a liquidation cascade?',
    a: 'When a large position gets liquidated, it can push the price further, triggering more liquidations in a chain reaction. SENTINEL\'s AI detects these cascades 5-60 minutes before they trigger.',
  },
  {
    q: 'How does Guard protect my positions?',
    a: 'Guard monitors your Pacifica positions every 10 seconds. When your margin ratio drops below your threshold, it automatically executes protective actions — partial close, full close, or margin top-up via Rhino.fi bridge.',
  },
  {
    q: 'Do I need a wallet to use SENTINEL?',
    a: 'No. SENTINEL uses Privy for authentication, which supports email, Google, and wallet login. If you don\'t have a wallet, Privy creates an embedded one for you.',
  },
  {
    q: 'What data does the Whale Intelligence use?',
    a: 'We combine Elfa AI social signals with Pacifica order flow data to track wallets making trades over $100K. Our intent classifier identifies whether whales are accumulating, distributing, hedging, or arbitraging.',
  },
  {
    q: 'Is it free?',
    a: 'The free tier gives you the liquidation radar (30s delay), 3 whale alerts per day, and basic features. Pro ($29/mo) unlocks real-time data, Guard bot, and all modules. Earn 1,000 Fuul referral points for 1 month Pro free.',
  },
  {
    q: 'Are cascade alerts stored on-chain?',
    a: 'Yes. High-confidence alerts (>85% probability) are published to our SentinelAlertRegistry smart contract on Arbitrum for verifiability and transparency.',
  },
];

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['Liquidation radar (30s delay)', '3 whale alerts/day', 'Basic cascade predictions', 'Community support'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: [
      'Real-time data (<500ms)',
      'Unlimited whale alerts',
      'SENTINEL Guard bot',
      'Funding rate forecasts',
      'Africa FX hedge calculator',
      'Priority support',
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
      'REST API access',
      'Custom webhooks',
      'White-glove onboarding',
      'Custom alert thresholds',
      'SLA guarantee',
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
            <SentinelLogo size={28} />
            <span className={styles.navBrandName}>SENTINEL</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <Link href="/docs">Docs</Link>
            <Link href="/onboarding" className={styles.navCta}>Launch App</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Built for the Pacifica Hackathon 2026
          </div>
          <h1 className={styles.heroTitle}>
            See the Cascade.
            <br />
            <span className={styles.heroAccent}>Stop the Wipeout.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            6 AI agents monitor liquidation cascades, track whale movements, and protect your positions — all in real time on Pacifica.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/onboarding" className={styles.ctaPrimary}>Get Started Free</Link>
            <a href="#features" className={styles.ctaSecondary}>Explore Features</a>
          </div>
        </div>
      </section>

      {/* Stats Ticker */}
      <section className={styles.statsTicker}>
        <div className={styles.statsInner}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.tickerStat}>
              <span className={styles.tickerValue}>{s.value}</span>
              <span className={styles.tickerLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <h2 className={styles.sectionTitle}>Everything You Need</h2>
        <p className={styles.sectionSubtitle}>
          Six specialized modules backed by six AI agents. One platform defending your capital.
        </p>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}><f.icon size={24} /></div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks} id="how-it-works">
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <p className={styles.sectionSubtitle}>Three steps to automated protection.</p>
        <div className={styles.stepsGrid}>
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className={styles.stepCard}>
              <span className={styles.stepNumber}>{step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sponsors */}
      <section className={styles.sponsors}>
        <p className={styles.sponsorsLabel}>Powered by</p>
        <div className={styles.sponsorGrid}>
          {SPONSORS.map((s) => (
            <div key={s.name} className={styles.sponsorCard}>
              <span className={styles.sponsorName}>{s.name}</span>
              <span className={styles.sponsorRole}>{s.role}</span>
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
                {tier.features.map((f) => (<li key={f}>{f}</li>))}
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

      {/* FAQ */}
      <section className={styles.faq} id="faq">
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          {FAQ.map((item) => (
            <div key={item.q} className={styles.faqCard}>
              <h4>{item.q}</h4>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <SentinelLogo size={20} />
            <span>SENTINEL</span>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/docs">Docs</Link>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <span className={styles.footerText}>Pacifica Hackathon 2026</span>
        </div>
      </footer>
    </div>
  );
}
