# SENTINEL Component Contracts

## Layout Components

### `<Sidebar />`
- **Path**: `src/components/layout/Sidebar/Sidebar.tsx`
- **Type**: Client component
- **Props**: None
- **Behavior**: Shows navigation, active route highlighting, brand

### `<Header />`
- **Path**: `src/components/layout/Header/Header.tsx`
- **Type**: Client component
- **Props**: None
- **Behavior**: Privy auth, agent status indicator, wallet display

## Module Components (Pages)

### `<LiquidationRadar />`
- **Path**: `src/components/modules/LiquidationRadar/`
- **Route**: `/` (home)
- **Data**: WebSocket liquidation events, cascade predictions
- **Key Features**: D3.js heatmap, cascade probability gauge, market sidebar with risk orbs

### `<WhaleIntelFeed />`
- **Path**: `src/components/modules/WhaleIntelFeed/`
- **Route**: `/whale-intelligence`
- **Data**: Elfa AI whale signals, Pacifica large orders
- **Key Features**: Card feed, intent badges, watchlist, convergence alerts

### `<SentinelGuard />`
- **Path**: `src/components/modules/SentinelGuard/`
- **Route**: `/guard`
- **Data**: Pacifica positions, guard configs, alert timeline
- **Key Features**: Margin gauge, guard toggle, alert timeline, Rhino.fi bridge

### `<AfricaHedgeCalculator />`
- **Path**: `src/components/modules/AfricaHedgeCalculator/`
- **Route**: `/africa-hedge`
- **Data**: CoinGecko FX rates, Pacifica funding rates
- **Key Features**: Currency selector, hedge calculator, plain-English recommendation

### `<FundingRateDashboard />`
- **Path**: `src/components/modules/FundingRateDashboard/`
- **Route**: `/funding-rates`
- **Data**: Pacifica funding rates, ARIMA+LSTM forecasts
- **Key Features**: Rates table, forecast chart, position carry costs

## SCSS Rules
- Every component has co-located `.module.scss`
- Zero inline styles
- All keyframes in `_animations.scss`
- All variables in `_variables.scss`
- All animations wrapped in `@media (prefers-reduced-motion: no-preference)`
