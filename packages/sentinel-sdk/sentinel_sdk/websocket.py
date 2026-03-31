"""Pacifica WebSocket client wrapper."""

import asyncio
import json
import logging
from typing import Any, Callable, Coroutine

import websockets

logger = logging.getLogger(__name__)

CHANNELS = ["liquidations", "orderbook", "funding", "trades", "positions"]


class PacificaWebSocket:
    """Async WebSocket client for Pacifica real-time data."""

    def __init__(self, ws_url: str, api_key: str = ""):
        self.ws_url = ws_url
        self.api_key = api_key
        self._ws = None
        self._running = False
        self._handlers: dict[str, list[Callable]] = {}
        self._reconnect_delay = 1

    def on(self, channel: str, handler: Callable[[dict], Coroutine[Any, Any, None]]) -> None:
        """Register an async handler for a WebSocket channel."""
        if channel not in self._handlers:
            self._handlers[channel] = []
        self._handlers[channel].append(handler)

    async def connect(self, channels: list[str] | None = None) -> None:
        """Connect to Pacifica WebSocket and subscribe to channels."""
        self._running = True
        subscribe_channels = channels or CHANNELS

        while self._running:
            try:
                async with websockets.connect(self.ws_url) as ws:
                    self._ws = ws
                    self._reconnect_delay = 1
                    logger.info("[PacificaWS] Connected to %s", self.ws_url)

                    # Subscribe to channels
                    for channel in subscribe_channels:
                        await ws.send(json.dumps({
                            "action": "subscribe",
                            "channel": channel,
                            "api_key": self.api_key if channel == "positions" else None,
                        }))
                        logger.info("[PacificaWS] Subscribed to %s", channel)

                    # Listen for messages
                    async for raw_message in ws:
                        try:
                            message = json.loads(raw_message)
                            channel = message.get("channel", "")
                            handlers = self._handlers.get(channel, [])
                            for handler in handlers:
                                await handler(message)
                        except json.JSONDecodeError:
                            logger.warning("[PacificaWS] Invalid JSON: %s", raw_message[:100])

            except websockets.ConnectionClosed as e:
                logger.warning("[PacificaWS] Connection closed: %s", e)
            except Exception as e:
                logger.error("[PacificaWS] Connection error: %s", e)

            if self._running:
                logger.info(
                    "[PacificaWS] Reconnecting in %ds...", self._reconnect_delay
                )
                await asyncio.sleep(self._reconnect_delay)
                self._reconnect_delay = min(self._reconnect_delay * 2, 5)

    async def disconnect(self) -> None:
        """Disconnect from WebSocket."""
        self._running = False
        if self._ws:
            await self._ws.close()
            logger.info("[PacificaWS] Disconnected")
