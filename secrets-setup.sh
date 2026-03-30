# SENTINEL — GitHub Secrets & Environment Variables Setup
# ============================================================
# Run this guide ONCE before your first push.
# All secrets go into GitHub → Settings → Secrets and Variables → Actions
# NEVER commit any of these values to the repository.
# ============================================================

# ── STEP 1: Install GitHub CLI ─────────────────────────────
# brew install gh        (macOS)
# sudo apt install gh    (Ubuntu)

# ── STEP 2: Authenticate ───────────────────────────────────
# gh auth login

# ── STEP 3: Set all secrets (replace <values> with actuals) ─
# Run each line in your terminal from the repo root.

# Railway
gh secret set RAILWAY_TOKEN                --body "<your-railway-token>"

# Pacifica API (testnet keys for dev, mainnet for production)
gh secret set PACIFICA_API_KEY             --body "<your-pacifica-api-key>"
gh secret set PACIFICA_API_SECRET          --body "<your-pacifica-api-secret>"
gh secret set PACIFICA_WALLET_ADDRESS      --body "<your-wallet-address>"

# Privy
gh secret set PRIVY_APP_ID                 --body "<your-privy-app-id>"
gh secret set PRIVY_APP_ID_TEST            --body "<your-privy-test-app-id>"
gh secret set PRIVY_APP_SECRET             --body "<your-privy-app-secret>"

# Fuul
gh secret set FUUL_API_KEY                 --body "<your-fuul-api-key>"
gh secret set FUUL_PROJECT_ID              --body "<your-fuul-project-id>"

# Elfa AI
gh secret set ELFA_API_KEY                 --body "<your-elfa-api-key>"

# Rhino.fi (if using private API)
gh secret set RHINOFI_API_KEY              --body "<your-rhinofi-api-key>"

# CoinGecko
gh secret set COINGECKO_API_KEY            --body "<your-coingecko-api-key>"

# Database (production Supabase)
gh secret set PROD_DATABASE_URL            --body "postgresql://..."

# Smart contracts (Arbitrum deployment)
gh secret set DEPLOYER_PRIVATE_KEY         --body "0x..."
gh secret set ARBITRUM_RPC_URL             --body "https://arb1.arbitrum.io/rpc"
gh secret set ARBISCAN_API_KEY             --body "<your-arbiscan-api-key>"
gh secret set ALERT_REGISTRY_ADDRESS       --body "0x..."

# Notifications
gh secret set SLACK_WEBHOOK_URL            --body "https://hooks.slack.com/..."

# ── STEP 4: Set GitHub Environment secrets ─────────────────
# Go to: Settings → Environments → Create environment: 'production'
# Add protection rule: "Required reviewers" — add yourself
# This forces a manual approval before any production deploy.

# Go to: Settings → Environments → Create environment: 'staging'
# No protection rules needed for staging.

# Go to: Settings → Environments → Create environment: 'contracts'
# Add protection rule: "Required reviewers" — contracts are IRREVERSIBLE.

# ── STEP 5: Create .env.local for local dev ─────────────────
# Copy the template below to apps/web/.env.local
# and apps/api/.env (both gitignored)

# apps/web/.env.local
# --------------------
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_WS_URL=ws://localhost:8000
# NEXT_PUBLIC_ENVIRONMENT=development
# NEXT_PUBLIC_PRIVY_APP_ID=<test-privy-app-id>
# NEXT_PUBLIC_FUUL_PROJECT_ID=<fuul-project-id>
# NEXT_PUBLIC_ALERT_REGISTRY_ADDRESS=0x...

# apps/api/.env
# --------------------
# ENVIRONMENT=development
# REDIS_URL=redis://localhost:6379/0
# DATABASE_URL=postgresql://sentinel:sentinel@localhost:5432/sentinel_dev
# PACIFICA_API_URL=https://test-api.pacifica.fi/api/v1
# PACIFICA_WS_URL=wss://test-ws.pacifica.fi
# PACIFICA_API_KEY=<testnet-key>
# PACIFICA_API_SECRET=<testnet-secret>
# ELFA_API_KEY=<elfa-key>
# PRIVY_APP_SECRET=<privy-secret>
# FUUL_API_KEY=<fuul-key>
# COINGECKO_API_KEY=<coingecko-key>

# ── STEP 6: Verify secrets are set ─────────────────────────
# gh secret list

# ── STEP 7: Branch protection ──────────────────────────────
# Go to: Settings → Branches → Add rule for 'main'
# Check:
#   ✅ Require a pull request before merging
#   ✅ Require status checks to pass before merging
#      Add: "Lint & Format Check", "Frontend Tests", "API & Agent Tests",
#            "Smart Contract Tests", "PR Hygiene", "No Inline Styles Check"
#   ✅ Require conversation resolution before merging
#   ✅ Do not allow bypassing the above settings

# ── IMPORTANT SECURITY NOTES ───────────────────────────────
# 1. The DEPLOYER_PRIVATE_KEY should be a DEDICATED deployment wallet
#    with ONLY enough ETH for gas. Never use your main wallet.
#
# 2. Rotate all API keys every 30 days in production.
#
# 3. The Pacifica API secret is used for ECDSA signing of all
#    private API requests. Keep it out of logs.
#
# 4. If any key is accidentally committed:
#    a) Revoke/rotate the key IMMEDIATELY
#    b) Force-push does NOT remove from git history
#    c) Use 'git filter-repo' to scrub history
#    d) Notify Architecture Lead