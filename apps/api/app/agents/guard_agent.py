"""SENTINEL Guard Agent — automated position protection.

Polls GET /account/positions every 10 seconds for all users with Guard enabled.
When margin ratio < configured threshold (default 15%):
  - Queues protective action in Redis (priority: 1)
  - Executes POST /orders with ECDSA-signed request
  - Actions: partial close (50%) | full close | Rhino.fi margin top-up
  - Stores every action in alerts_log table
  - Retries once on failure, then notifies user
"""

import asyncio
import logging

logger = logging.getLogger(__name__)

POLL_INTERVAL = 10  # seconds


class GuardAgent:
    """Monitors positions and executes protective orders."""

    def __init__(self):
        self.running = False
        self.monitoring_count = 0

    async def start(self) -> None:
        """Start the guard polling loop."""
        self.running = True
        logger.info("[GuardAgent] Started — polling every %ds", POLL_INTERVAL)

        while self.running:
            try:
                await self._check_positions()
            except Exception as e:
                logger.error("[GuardAgent] Error in poll cycle: %s", e)

            await asyncio.sleep(POLL_INTERVAL)

    async def stop(self) -> None:
        """Stop the guard polling loop."""
        self.running = False
        logger.info("[GuardAgent] Stopped")

    async def _check_positions(self) -> None:
        """Check all monitored positions against thresholds."""
        # TODO: Phase 2 — fetch positions from Pacifica API
        # For each user with guard_enabled:
        #   1. GET /account/positions
        #   2. Compare margin_ratio to threshold
        #   3. If below threshold → queue protective action
        pass

    async def _execute_protective_action(
        self,
        user_id: str,
        symbol: str,
        action_type: str,
        partial_close_pct: float = 50.0,
    ) -> dict:
        """Execute a protective order on Pacifica."""
        # TODO: Phase 2 — ECDSA-signed POST /orders
        return {"status": "pending", "message": "Not yet implemented"}


guard_agent = GuardAgent()
