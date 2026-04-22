'use client';

import Link from 'next/link';
import { SentinelLogo } from '@/components/icons/Icons';
import styles from './Docs.module.scss';

const SIDEBAR_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'quickstart', label: 'Quick Start' },
  { id: 'modules', label: 'Modules' },
  { id: 'agents', label: 'AI Agents' },
  { id: 'api', label: 'API Reference' },
  { id: 'websocket', label: 'WebSocket Events' },
  { id: 'contracts', label: 'Smart Contracts' },
  { id: 'tiers', label: 'Tier System' },
];

const API_ENDPOINTS = [
  { method: 'GET', path: '/health', auth: false, desc: 'Service health check' },
  { method: 'GET', path: '/health/agents', auth: false, desc: 'All 6 agent statuses' },
  { method: 'GET', path: '/api/v1/markets', auth: false, desc: 'Active Pacifica markets' },
  { method: 'GET', path: '/api/v1/alerts/cascade', auth: false, desc: 'Current cascade predictions' },
  { method: 'GET', path: '/api/v1/whale/events', auth: false, desc: 'Recent whale activity' },
  { method: 'GET', path: '/api/v1/whale/convergence', auth: false, desc: 'Smart money convergence' },
  { method: 'GET', path: '/api/v1/funding/rates', auth: false, desc: 'Live funding rates' },
  { method: 'GET', path: '/api/v1/funding/forecast/:symbol', auth: false, desc: '4-epoch ARIMA+LSTM forecast' },
  { method: 'GET', path: '/api/v1/positions', auth: true, desc: 'Open Pacifica positions' },
  { method: 'GET', path: '/api/v1/guard/config', auth: true, desc: 'Guard bot configuration' },
  { method: 'PUT', path: '/api/v1/guard/config', auth: true, desc: 'Update guard config' },
  { method: 'GET', path: '/api/v1/hedge/rates', auth: false, desc: 'NGN/KES/GHS FX rates' },
  { method: 'POST', path: '/api/v1/hedge/calculate', auth: false, desc: 'Hedge recommendation' },
  { method: 'GET', path: '/api/v1/referral/code', auth: false, desc: 'Get/create referral code for wallet' },
  { method: 'GET', path: '/api/v1/referral/stats', auth: false, desc: 'Referral stats and conversions' },
  { method: 'POST', path: '/api/v1/referral/convert', auth: false, desc: 'Track referral conversion' },
  { method: 'GET', path: '/api/v1/referral/leaderboard', auth: false, desc: 'Top referrers by points' },
];

const WS_CHANNELS = [
  { channel: 'liquidation', desc: 'Real-time liquidation events across all markets', payload: '{ symbol, side, price, size, notionalValue }' },
  { channel: 'whale', desc: 'New whale events from Elfa AI + Pacifica order flow', payload: '{ id, wallet_address, action_type, size_usd, market, intent, elfa_score }' },
  { channel: 'guard', desc: 'Position health updates and guard action notifications', payload: '{ symbol, margin_ratio, mark_price, health_score }' },
  { channel: 'funding', desc: 'Funding rate updates per epoch', payload: '{ symbol, rate, nextFundingTime, markPrice }' },
  { channel: 'cascade', desc: 'Cascade prediction alerts when probability exceeds threshold', payload: '{ market, probability, severity, time_horizon }' },
];

export default function DocsPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.topNav}>
        <div className={styles.topNavInner}>
          <Link href="/" className={styles.topNavBrand}>
            <SentinelLogo size={24} />
            <span>SENTINEL</span>
            <span className={styles.docsLabel}>Docs</span>
          </Link>
          <div className={styles.topNavLinks}>
            <Link href="/">Home</Link>
            <Link href="/onboarding">Launch App</Link>
          </div>
        </div>
      </nav>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          {SIDEBAR_SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={styles.sidebarLink}>{s.label}</a>
          ))}
        </aside>

        <main className={styles.content}>
          {/* Overview */}
          <section id="overview" className={styles.section}>
            <h1>SENTINEL Documentation</h1>
            <p className={styles.lead}>
              AI-Powered Liquidation Defense & Whale Intelligence Platform for Pacifica traders.
              SENTINEL runs 6 AI agents that monitor liquidation cascades, track whale movements,
              and protect your positions — all in real time.
            </p>

            <div className={styles.archGrid}>
              <div className={styles.archCard}>
                <h4>Frontend</h4>
                <p>Next.js 14, TypeScript, SCSS Modules, D3.js, Socket.io, Privy Auth</p>
              </div>
              <div className={styles.archCard}>
                <h4>Backend</h4>
                <p>FastAPI, Python 3.11, Redis, PostgreSQL, scikit-learn, TensorFlow</p>
              </div>
              <div className={styles.archCard}>
                <h4>Contracts</h4>
                <p>Solidity 0.8.20, Hardhat, OpenZeppelin, Arbitrum Mainnet</p>
              </div>
            </div>
          </section>

          {/* Quick Start */}
          <section id="quickstart" className={styles.section}>
            <h2>Quick Start</h2>
            <div className={styles.codeBlock}>
              <code>
                <span className={styles.comment}># Clone and setup</span>{'\n'}
                git clone https://github.com/YOUR_ORG/sentinel.git{'\n'}
                cd sentinel{'\n'}
                cp .env.example .env{'\n\n'}
                <span className={styles.comment}># Start everything with Docker</span>{'\n'}
                docker compose up --build{'\n\n'}
                <span className={styles.comment}># Or start individually</span>{'\n'}
                cd apps/web && npm install && npm run dev{'\n'}
                cd apps/api && pip install -r requirements.txt && uvicorn app.main:app --reload
              </code>
            </div>
            <div className={styles.serviceTable}>
              <div className={styles.serviceRow}><span>Frontend</span><code>http://localhost:3000</code></div>
              <div className={styles.serviceRow}><span>API</span><code>http://localhost:8000</code></div>
              <div className={styles.serviceRow}><span>API Docs</span><code>http://localhost:8000/docs</code></div>
              <div className={styles.serviceRow}><span>Redis</span><code>localhost:6379</code></div>
              <div className={styles.serviceRow}><span>PostgreSQL</span><code>localhost:5432</code></div>
            </div>
          </section>

          {/* Modules */}
          <section id="modules" className={styles.section}>
            <h2>Modules</h2>
            <div className={styles.moduleGrid}>
              {[
                { name: 'M1 — Liquidation Radar', route: '/dashboard', desc: 'D3.js heatmap visualizing liquidation clusters. Cascade probability gauge, market sidebar with risk scoring.' },
                { name: 'M2 — Whale Intelligence', route: '/whale-intelligence', desc: 'Elfa AI-powered whale tracking with intent classification. Convergence alerts when 3+ whales align.' },
                { name: 'M3 — SENTINEL Guard', route: '/guard', desc: 'Automated position protection. Polls every 10s, executes partial close / full close / add margin.' },
                { name: 'M4 — Africa FX Hedge', route: '/africa-hedge', desc: 'NGN/KES/GHS hedge calculator using BTC perpetuals. Purpose-built for African businesses.' },
                { name: 'M5 — Funding Rate Intel', route: '/funding-rates', desc: 'ARIMA + LSTM ensemble forecast 4 epochs ahead with confidence bands.' },
              ].map((m) => (
                <div key={m.name} className={styles.moduleCard}>
                  <h4>{m.name}</h4>
                  <p>{m.desc}</p>
                  <code>{m.route}</code>
                </div>
              ))}
            </div>
          </section>

          {/* Agents */}
          <section id="agents" className={styles.section}>
            <h2>AI Agents</h2>
            <p>All agents run as parallel async tasks via the worker runner. Each has independent polling intervals and publishes to Redis channels.</p>
            <div className={styles.agentGrid}>
              {[
                { name: 'Guard Agent', interval: '10s', desc: 'Monitors margin ratios, executes protective orders' },
                { name: 'Cascade Predictor', interval: '30s', desc: 'ML inference on liquidation probability, publishes >85% to Arbitrum' },
                { name: 'Whale Intel Agent', interval: '60s', desc: 'Elfa AI polling, intent classification, convergence detection' },
                { name: 'Funding Forecast', interval: '8h', desc: 'ARIMA + LSTM ensemble on full funding history' },
                { name: 'Africa FX Advisor', interval: '60s', desc: 'CoinGecko FX polling, hedge recommendation engine' },
                { name: 'Alert Broadcaster', interval: '1s', desc: 'Redis queue → Socket.io push + Fuul referral links' },
              ].map((a) => (
                <div key={a.name} className={styles.agentCard}>
                  <div className={styles.agentHeader}>
                    <h4>{a.name}</h4>
                    <code>{a.interval}</code>
                  </div>
                  <p>{a.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* API Reference */}
          <section id="api" className={styles.section}>
            <h2>API Reference</h2>
            <p>Base URL: <code>http://localhost:8000</code></p>
            <div className={styles.apiTable}>
              <div className={styles.apiHeader}>
                <span>Method</span><span>Endpoint</span><span>Auth</span><span>Description</span>
              </div>
              {API_ENDPOINTS.map((ep) => (
                <div key={ep.path + ep.method} className={styles.apiRow}>
                  <span className={`${styles.method} ${styles[`method${ep.method}`]}`}>{ep.method}</span>
                  <code>{ep.path}</code>
                  <span>{ep.auth ? 'Yes' : 'No'}</span>
                  <span>{ep.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* WebSocket */}
          <section id="websocket" className={styles.section}>
            <h2>WebSocket Events</h2>
            <p>Connect via Socket.io to <code>ws://localhost:8000</code></p>
            {WS_CHANNELS.map((ch) => (
              <div key={ch.channel} className={styles.wsChannel}>
                <div className={styles.wsHeader}>
                  <code className={styles.wsName}>{ch.channel}</code>
                  <span>{ch.desc}</span>
                </div>
                <div className={styles.codeBlock}><code>{ch.payload}</code></div>
              </div>
            ))}
          </section>

          {/* Smart Contracts */}
          <section id="contracts" className={styles.section}>
            <h2>Smart Contracts</h2>
            <h3>SentinelAlertRegistry</h3>
            <p>Deployed to Ethereum Sepolia testnet. Stores high-confidence cascade alerts (probability &gt; 85%) on-chain for verifiability and transparency.</p>

            <div className={styles.serviceTable}>
              <div className={styles.serviceRow}>
                <span>Network</span>
                <code>Ethereum Sepolia</code>
              </div>
              <div className={styles.serviceRow}>
                <span>Chain ID</span>
                <code>11155111</code>
              </div>
              <div className={styles.serviceRow}>
                <span>Contract Address</span>
                <code>0x486aFe3c1e3dE1253B31C82A30d5270e63403c27</code>
              </div>
              <div className={styles.serviceRow}>
                <span>Etherscan</span>
                <a
                  href="https://sepolia.etherscan.io/address/0x486aFe3c1e3dE1253B31C82A30d5270e63403c27"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Sepolia Etherscan
                </a>
              </div>
              <div className={styles.serviceRow}>
                <span>Authorized Publisher</span>
                <code>0xE5A747FA09271C8d479Cf718b205F8aADd6E4C30</code>
              </div>
            </div>

            <h3>Interface</h3>
            <div className={styles.codeBlock}>
              <code>
                <span className={styles.comment}>// Publish a cascade alert (only authorized publisher)</span>{'\n'}
                function publishAlert({'\n'}
                {'  '}string memory market,{'\n'}
                {'  '}uint256 cascadeProbability, <span className={styles.comment}>// basis points (8500 = 85%)</span>{'\n'}
                {'  '}uint8 severity <span className={styles.comment}>// 1=WATCH 2=ALERT 3=CASCADE_IMMINENT</span>{'\n'}
                ) external onlyAuthorizedPublisher{'\n\n'}
                <span className={styles.comment}>// Read alerts (public)</span>{'\n'}
                function getAlertCount() view returns (uint256){'\n'}
                function getAlert(uint256 alertId) view returns (Alert){'\n\n'}
                <span className={styles.comment}>// Event emitted on every alert</span>{'\n'}
                event AlertPublished({'\n'}
                {'  '}uint256 indexed alertId,{'\n'}
                {'  '}address indexed publisher,{'\n'}
                {'  '}string market,{'\n'}
                {'  '}uint256 probability,{'\n'}
                {'  '}uint8 severity,{'\n'}
                {'  '}uint256 timestamp{'\n'}
                )
              </code>
            </div>

            <h3>Custom Errors (Gas-Optimized)</h3>
            <div className={styles.codeBlock}>
              <code>
                error NotAuthorized();{'\n'}
                error InvalidSeverity();{'\n'}
                error InvalidProbability();
              </code>
            </div>
          </section>

          {/* Tiers */}
          <section id="tiers" className={styles.section}>
            <h2>Tier System</h2>
            <div className={styles.tierTable}>
              <div className={styles.tierHeader}>
                <span>Feature</span><span>Free</span><span>Pro ($29)</span><span>Institutional ($499)</span>
              </div>
              {[
                { feature: 'Real-time data', free: '30s delay', pro: '<500ms', inst: '<500ms' },
                { feature: 'Whale alerts', free: '3/day', pro: 'Unlimited', inst: 'Unlimited' },
                { feature: 'Guard bot', free: 'No', pro: 'Yes', inst: 'Yes' },
                { feature: 'Funding forecasts', free: 'No', pro: 'Yes', inst: 'Yes' },
                { feature: 'API access', free: 'No', pro: 'No', inst: 'Yes' },
                { feature: 'Webhooks', free: 'No', pro: 'No', inst: 'Yes' },
              ].map((row) => (
                <div key={row.feature} className={styles.tierRow}>
                  <span>{row.feature}</span><span>{row.free}</span><span>{row.pro}</span><span>{row.inst}</span>
                </div>
              ))}
            </div>
            <p className={styles.tierNote}>Earn 1,000 Fuul referral points = 1 month Pro free</p>
          </section>
        </main>
      </div>
    </div>
  );
}
