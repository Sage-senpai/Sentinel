"""Whale Intel Agent — whale wallet tracking via Elfa AI + Pacifica.

Polls Elfa AI every 60 seconds for whale wallet signals.
Cross-references with Pacifica large order flow (orders > $100k).
Classifies intent: ACCUMULATING | DISTRIBUTING | HEDGING | ARBITRAGE | UNKNOWN.
Smart Money Convergence: fires when 3+ whales open same direction
  on same market within 15-minute window.
"""

import asyncio
import logging

logger = logging.getLogger(__name__)

POLL_INTERVAL = 60  # seconds
LARGE_ORDER_THRESHOLD = 100_000  # USD


class WhaleAgent:
    """Tracks whale wallet activity and classifies intent."""

    def __init__(self):
        self.running = False
        self.convergence_window: list = []

    async def start(self) -> None:
        self.running = True
        logger.info("[WhaleAgent] Started — polling every %ds", POLL_INTERVAL)

        while self.running:
            try:
                await self._poll_elfa()
                await self._check_convergence()
            except Exception as e:
                logger.error("[WhaleAgent] Error: %s", e)

            await asyncio.sleep(POLL_INTERVAL)

    async def stop(self) -> None:
        self.running = False
        logger.info("[WhaleAgent] Stopped")

    async def _poll_elfa(self) -> None:
        """Fetch whale signals from Elfa AI."""
        # TODO: Phase 2 — integrate Elfa AI API
        pass

    async def _classify_intent(self, wallet: str, actions: list) -> str:
        """Classify whale intent based on recent actions."""
        # TODO: Phase 2 — implement classification logic
        return "UNKNOWN"

    async def _check_convergence(self) -> None:
        """Check for Smart Money Convergence (3+ whales same direction)."""
        # TODO: Phase 2 — 15-minute window convergence check
        pass


whale_agent = WhaleAgent()
