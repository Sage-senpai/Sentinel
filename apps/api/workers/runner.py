"""SENTINEL Agent Worker Runner — starts all 6 agents in parallel."""

import asyncio
import logging
import signal

from app.core.config import settings
from app.agents.guard_agent import guard_agent
from app.agents.cascade_agent import cascade_agent
from app.agents.whale_agent import whale_agent
from app.agents.funding_agent import funding_agent
from app.agents.africa_agent import africa_agent
from app.agents.broadcast_agent import broadcast_agent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


async def run_agents() -> None:
    """Start all enabled agents as concurrent tasks."""
    tasks = []

    agents = [
        ("guard", guard_agent, settings.agent_guard_enabled),
        ("cascade_predictor", cascade_agent, settings.agent_cascade_enabled),
        ("whale_intel", whale_agent, settings.agent_whale_enabled),
        ("funding_forecast", funding_agent, settings.agent_funding_enabled),
        ("africa_fx", africa_agent, settings.agent_africa_enabled),
        ("alert_broadcast", broadcast_agent, settings.agent_broadcast_enabled),
    ]

    for name, agent, enabled in agents:
        if enabled:
            logger.info("Starting agent: %s", name)
            tasks.append(asyncio.create_task(agent.start()))
        else:
            logger.info("Agent disabled: %s", name)

    if not tasks:
        logger.warning("No agents enabled — worker idle")
        return

    logger.info("All %d agents running", len(tasks))
    await asyncio.gather(*tasks)


async def shutdown(agents_to_stop: list) -> None:
    """Gracefully stop all agents."""
    logger.info("Shutting down agents...")
    for agent in agents_to_stop:
        await agent.stop()


def main() -> None:
    loop = asyncio.new_event_loop()

    all_agents = [
        guard_agent, cascade_agent, whale_agent,
        funding_agent, africa_agent, broadcast_agent,
    ]

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, lambda: asyncio.ensure_future(shutdown(all_agents)))
        except NotImplementedError:
            pass  # Windows doesn't support add_signal_handler

    try:
        loop.run_until_complete(run_agents())
    except KeyboardInterrupt:
        loop.run_until_complete(shutdown(all_agents))
    finally:
        loop.close()


if __name__ == "__main__":
    main()
