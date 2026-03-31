-- ============================================================
--  SENTINEL — Database Initialization
--  Run automatically by PostgreSQL Docker container
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    privy_id        text UNIQUE NOT NULL,
    wallet_address  text,
    tier            text DEFAULT 'free',
    points          integer DEFAULT 0,
    home_module     text DEFAULT 'liquidation-radar',
    created_at      timestamptz DEFAULT now()
);

-- ── Bot Configs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bot_configs (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           uuid REFERENCES users(id) ON DELETE CASCADE,
    position_symbol   text NOT NULL,
    guard_enabled     boolean DEFAULT false,
    threshold_pct     decimal DEFAULT 15.0,
    action_type       text DEFAULT 'partial_close',
    partial_close_pct decimal DEFAULT 50.0,
    max_spend_usd     decimal,
    created_at        timestamptz DEFAULT now(),
    updated_at        timestamptz DEFAULT now()
);

-- ── Alerts Log ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts_log (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
    module          text NOT NULL,
    market          text,
    severity        text,
    probability     decimal,
    action_taken    text,
    order_id        text,
    execution_price decimal,
    onchain_tx_hash text,
    fuul_link       text,
    created_at      timestamptz DEFAULT now()
);

-- ── Whale Events ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whale_events (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address  text NOT NULL,
    action_type     text NOT NULL,
    size_usd        decimal,
    market          text,
    intent          text,
    elfa_score      decimal,
    created_at      timestamptz DEFAULT now()
);

-- ── Positions History ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS positions_history (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
    symbol          text,
    direction       text,
    size            decimal,
    entry_price     decimal,
    margin_ratio    decimal,
    health_score    integer,
    snapshot_at     timestamptz DEFAULT now()
);

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions_history ENABLE ROW LEVEL SECURITY;

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_alerts_log_user ON alerts_log(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_log_module ON alerts_log(module);
CREATE INDEX IF NOT EXISTS idx_alerts_log_created ON alerts_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whale_events_wallet ON whale_events(wallet_address);
CREATE INDEX IF NOT EXISTS idx_whale_events_created ON whale_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_positions_history_user ON positions_history(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_configs_user ON bot_configs(user_id);
