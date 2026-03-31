# SENTINEL

**AI-Powered Liquidation Defense & Whale Intelligence Platform**

*See the Cascade. Stop the Wipeout.*

Built for the **Pacifica Hackathon 2026** | Deadline: April 16, 2026

---

## What is SENTINEL?

SENTINEL solves three critical problems every DeFi perpetual trader faces:

1. **Liquidation cascades strike without warning** — our Cascade Predictor AI detects them 5-60 minutes early
2. **Whale movements are invisible** — our Whale Intelligence engine tracks, classifies, and alerts on large player activity
3. **No automated safety net** — SENTINEL Guard monitors positions 24/7 and executes protective orders automatically

## Architecture

### Five Core Modules

| Module | Description | Key Tech |
|--------|-------------|----------|
| **M1 — Liquidation Radar** | Live heatmap + AI cascade predictor | D3.js, WebSocket, ML |
| **M2 — Whale Intelligence** | Large-order tracking + intent classification | Elfa AI, Pacifica API |
| **M3 — SENTINEL Guard** | Automated protective order bot | Pacifica SDK, ECDSA |
| **M4 — Africa FX Hedge** | NGN/KES/GHS hedge calculator | CoinGecko, Pacifica |
| **M5 — Funding Rate Intel** | 4-epoch forecast model | ARIMA, LSTM |

### Six AI Agents

All agents run as parallel background tasks:

1. **Guard Agent** — Polls positions every 10s, executes protective orders
2. **Cascade Predictor** — ML inference every 30s, publishes high-confidence alerts on-chain
3. **Whale Intel Agent** — Elfa AI polling + intent classification + convergence detection
4. **Funding Forecast Agent** — ARIMA + LSTM ensemble, runs every 8h epoch
5. **Africa FX Advisor** — CoinGecko FX polling + hedge recommendation engine
6. **Alert Broadcaster** — Unified alert pipeline via Socket.io + Fuul referral links

## Monorepo Structure

```
sentinel/
├── apps/
│   ├── web/                 # Next.js 14 (App Router, TypeScript strict)
│   ├── api/                 # FastAPI (Python 3.11, uvicorn)
│   └── contracts/           # Hardhat + Solidity (Arbitrum)
├── packages/
│   ├── shared/              # TypeScript types shared across apps
│   └── sentinel-sdk/        # Pacifica Python SDK abstraction
├── docs/
│   ├── api-contracts.md     # API endpoint documentation
│   ├── component-contracts.md
│   └── decisions/
├── .github/
│   ├── workflows/           # CI/CD pipelines
│   └── lighthouse-budget.json
├── docker-compose.yml       # Local dev environment
├── .env.example             # Environment variable template
└── README.md
```

## Tech Stack

### Frontend
- Next.js 14 (App Router, Server + Client Components)
- TypeScript (strict mode, zero `any` types)
- SCSS Modules (all styling, zero inline styles)
- D3.js v7 (heatmap, charts)
- Three.js r128 (whale radar globe)
- Framer Motion (animations)
- Privy (embedded wallet + social login)
- ethers.js v6 (on-chain interactions)
- Socket.io client (real-time alerts)

### Backend
- FastAPI (Python 3.11, uvicorn)
- Redis (pub/sub event pipeline)
- PostgreSQL via Supabase (RLS enabled)
- Pacifica Python SDK
- scikit-learn + statsmodels (cascade predictor)
- TensorFlow/Keras (LSTM funding model)

### Smart Contracts
- Solidity ^0.8.20 (SentinelAlertRegistry)
- Hardhat + OpenZeppelin
- Deployed to Arbitrum mainnet

### Sponsor Integrations
- **Privy** — Auth + embedded wallet
- **Elfa AI** — Whale intelligence + social signals
- **Fuul** — Referral links + points engine
- **Rhino.fi** — Cross-chain emergency margin bridge

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_ORG/sentinel.git
   cd sentinel
   ```

2. **Copy environment template**
   ```bash
   cp .env.example .env
   # Fill in your API keys
   ```

3. **Start with Docker Compose** (recommended)
   ```bash
   docker compose up --build
   ```
   This starts: web (3000), api (8000), workers, redis (6379), postgres (5432)

4. **Or start services individually**
   ```bash
   # Frontend
   cd apps/web && npm install && npm run dev

   # Backend
   cd apps/api && pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000

   # Workers
   cd apps/api && python -m workers.runner
   ```

5. **Smart contracts**
   ```bash
   cd apps/contracts && npm install
   npx hardhat compile
   npx hardhat test
   ```

### Accessing the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Redis Commander | http://localhost:8081 (debug profile) |
| Hardhat Node | http://localhost:8545 (contracts profile) |

## API Endpoints

See [docs/api-contracts.md](docs/api-contracts.md) for full API documentation.

### Quick Reference

```
GET  /health                    # Service health
GET  /health/agents             # All 6 agent statuses
GET  /api/v1/markets            # Active markets
GET  /api/v1/alerts/cascade     # Cascade predictions
GET  /api/v1/whale/events       # Whale activity feed
GET  /api/v1/funding/rates      # Live funding rates
POST /api/v1/hedge/calculate    # Hedge recommendation
GET  /api/v1/guard/status       # Guard bot status
```

## Smart Contract

**SentinelAlertRegistry.sol** — Deployed to Arbitrum mainnet

Stores high-confidence (>85%) cascade alerts on-chain for verifiability.

```solidity
function publishAlert(string market, uint256 probability, uint8 severity)
function getAlertCount() returns (uint256)
function getAlert(uint256 alertId) returns (Alert)
```

## CI/CD

Three GitHub Actions workflows:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci-cd.yml` | Push to main/dev | Full pipeline: lint, test, build, deploy |
| `pr-gate.yml` | PRs to main/dev | Quality gates: no inline styles, SCSS rules, secret scan |
| `health-monitor.yml` | Every 15min (cron) | Production health checks |

## Performance Standards

- Lighthouse score >= 85
- First Contentful Paint < 2,000ms
- Time to Interactive < 4,000ms
- Heatmap update < 500ms from WebSocket event
- API P99 < 200ms under 100 concurrent users
- WebSocket auto-reconnect within 5s

## Database

PostgreSQL with Row Level Security on all tables:

- `users` — Privy-authenticated user profiles
- `bot_configs` — Guard bot configurations per position
- `alerts_log` — All agent actions with full metadata
- `whale_events` — Whale activity history
- `positions_history` — Position snapshots for health tracking

## Tier System

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Heatmap (30s delay), 3 whale alerts/day |
| Pro | $29/mo | Real-time everything, Guard Bot, all modules |
| Institutional | $499/mo | API access, webhooks, white-label |

1,000 Fuul referral points = 1 month Pro free

## License

MIT

---

**SENTINEL** — See the Cascade. Stop the Wipeout.
