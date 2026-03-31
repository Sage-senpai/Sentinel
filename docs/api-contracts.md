# SENTINEL API Contracts

## Base URL
- Development: `http://localhost:8000`
- Staging: `https://staging-api.sentinel.app`
- Production: `https://api.sentinel.app`

## Health Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health |
| GET | `/health/ws` | WebSocket status |
| GET | `/health/pacifica` | Pacifica API reachability |
| GET | `/health/redis` | Redis connectivity |
| GET | `/health/agents` | All 6 agent statuses |

## Markets

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/markets` | No | All active Pacifica markets |
| GET | `/api/v1/markets/:symbol/orderbook` | No | Current orderbook depth |

## Alerts

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/alerts` | Yes | User's alert history |
| GET | `/api/v1/alerts/cascade` | No | Current cascade predictions |

## Positions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/positions` | Yes | Open Pacifica positions |
| GET | `/api/v1/positions/history` | Yes | Position snapshots |

## Guard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/guard/config` | Yes | Guard bot configs |
| PUT | `/api/v1/guard/config` | Yes | Update guard config |
| GET | `/api/v1/guard/status` | Yes | Current guard status |

## Whale Intelligence

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/whale/events` | No | Recent whale events |
| GET | `/api/v1/whale/convergence` | No | Convergence alerts |
| GET | `/api/v1/whale/watchlist` | Yes | User's watchlist |

## Funding Rates

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/funding/rates` | No | Current funding rates |
| GET | `/api/v1/funding/forecast/:symbol` | No | 4-epoch forecast |
| GET | `/api/v1/funding/history/:symbol` | No | 30-day history |

## Africa FX Hedge

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/hedge/rates` | No | NGN/KES/GHS rates |
| POST | `/api/v1/hedge/calculate` | No | Hedge calculation |

## WebSocket Events

| Channel | Description |
|---------|-------------|
| `alerts` | Real-time alerts from all agents |
| `cascade` | Cascade prediction updates |
| `whale` | New whale events |
| `guard` | Guard action notifications |
| `funding` | Funding rate updates |
