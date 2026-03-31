"""Africa FX Advisor Agent — hedge calculations for NGN/KES/GHS.

Polls CoinGecko every 60 seconds for FX rates.
Calculates hedge recommendation:
  S = (portfolio_value_USD x hedge_ratio) / BTC_price
Adjusts for current funding rate (carry cost/benefit).
"""

import asyncio
import logging

logger = logging.getLogger(__name__)

POLL_INTERVAL = 60  # seconds
SUPPORTED_CURRENCIES = ["NGN", "KES", "GHS"]


class AfricaAgent:
    """Provides FX hedge recommendations for African currencies."""

    def __init__(self):
        self.running = False
        self.rates: dict[str, float] = {}

    async def start(self) -> None:
        self.running = True
        logger.info("[AfricaAgent] Started — polling FX every %ds", POLL_INTERVAL)

        while self.running:
            try:
                await self._poll_fx_rates()
            except Exception as e:
                logger.error("[AfricaAgent] FX poll error: %s", e)

            await asyncio.sleep(POLL_INTERVAL)

    async def stop(self) -> None:
        self.running = False
        logger.info("[AfricaAgent] Stopped")

    async def _poll_fx_rates(self) -> None:
        """Fetch NGN/KES/GHS rates from CoinGecko."""
        # TODO: Phase 2 — CoinGecko API integration
        pass

    def calculate_hedge(
        self,
        portfolio_value_usd: float,
        hedge_ratio: float,
        btc_price: float,
        funding_rate: float,
    ) -> dict:
        """Calculate hedge recommendation."""
        hedge_amount = portfolio_value_usd * (hedge_ratio / 100)
        short_size = hedge_amount / btc_price if btc_price > 0 else 0
        leverage = 2
        required_margin = hedge_amount / leverage
        daily_carry = hedge_amount * funding_rate * 3  # 3 epochs/day

        return {
            "short_size_btc": short_size,
            "required_margin_usd": required_margin,
            "daily_carry_usd": daily_carry,
            "leverage": leverage,
        }


africa_agent = AfricaAgent()
