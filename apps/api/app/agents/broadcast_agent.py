"""Alert Broadcasting Agent — unified alert pipeline.

Aggregates outputs from all 5 agents into a unified alert queue.
Pushes via Socket.io to authenticated frontend clients.
Generates Fuul referral links for each alert.
Stores all alerts in supabase alerts_log with full metadata.
"""

import asyncio
import logging

logger = logging.getLogger(__name__)

POLL_INTERVAL = 1  # check queue every second


class BroadcastAgent:
    """Aggregates and broadcasts alerts from all agents."""

    def __init__(self):
        self.running = False
        self.connected_clients: set = set()

    async def start(self) -> None:
        self.running = True
        logger.info("[BroadcastAgent] Started — listening for alerts")

        while self.running:
            try:
                await self._process_alert_queue()
            except Exception as e:
                logger.error("[BroadcastAgent] Error: %s", e)

            await asyncio.sleep(POLL_INTERVAL)

    async def stop(self) -> None:
        self.running = False
        logger.info("[BroadcastAgent] Stopped")

    async def _process_alert_queue(self) -> None:
        """Check Redis queue for new alerts and broadcast."""
        # TODO: Phase 2 — Redis BLPOP on alert queue
        # For each alert:
        #   1. Generate Fuul referral link
        #   2. Push via Socket.io to matching clients
        #   3. Store in alerts_log
        pass


broadcast_agent = BroadcastAgent()
