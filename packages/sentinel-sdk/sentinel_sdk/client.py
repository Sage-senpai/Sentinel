"""Pacifica REST API client wrapper."""

import hashlib
import hmac
import time
from typing import Any

import httpx


class PacificaClient:
    """Async HTTP client for Pacifica REST API."""

    def __init__(self, api_url: str, api_key: str = "", api_secret: str = ""):
        self.api_url = api_url.rstrip("/")
        self.api_key = api_key
        self.api_secret = api_secret
        self._client = httpx.AsyncClient(timeout=30.0)

    async def close(self) -> None:
        await self._client.aclose()

    def _sign_request(self, method: str, path: str, body: str = "") -> dict[str, str]:
        """Generate ECDSA signature headers for authenticated requests."""
        timestamp = str(int(time.time() * 1000))
        message = f"{timestamp}{method.upper()}{path}{body}"
        signature = hmac.new(
            self.api_secret.encode(),
            message.encode(),
            hashlib.sha256,
        ).hexdigest()

        return {
            "X-API-Key": self.api_key,
            "X-Timestamp": timestamp,
            "X-Signature": signature,
        }

    async def get(self, path: str, authenticated: bool = False) -> Any:
        """Make authenticated or public GET request."""
        url = f"{self.api_url}{path}"
        headers = self._sign_request("GET", path) if authenticated else {}
        response = await self._client.get(url, headers=headers)
        response.raise_for_status()
        return response.json()

    async def post(self, path: str, data: dict, authenticated: bool = True) -> Any:
        """Make authenticated POST request."""
        import json

        url = f"{self.api_url}{path}"
        body = json.dumps(data)
        headers = self._sign_request("POST", path, body) if authenticated else {}
        headers["Content-Type"] = "application/json"
        response = await self._client.post(url, content=body, headers=headers)
        response.raise_for_status()
        return response.json()

    # ── Public endpoints ─────────────────────────────────────
    async def get_markets(self) -> list[dict]:
        return await self.get("/markets")

    async def get_orderbook(self, symbol: str) -> dict:
        return await self.get(f"/orderbook/{symbol}")

    async def get_trades(self, symbol: str) -> list[dict]:
        return await self.get(f"/trades?symbol={symbol}")

    async def get_funding_rates(self) -> list[dict]:
        return await self.get("/funding/rates")

    # ── Authenticated endpoints ──────────────────────────────
    async def get_account(self) -> dict:
        return await self.get("/account", authenticated=True)

    async def get_positions(self) -> list[dict]:
        return await self.get("/account/positions", authenticated=True)

    async def get_margin(self) -> dict:
        return await self.get("/account/margin", authenticated=True)

    async def get_orders(self) -> list[dict]:
        return await self.get("/account/orders", authenticated=True)

    async def submit_order(self, order: dict) -> dict:
        return await self.post("/orders", order)

    async def get_order_status(self, order_id: str) -> dict:
        return await self.get(f"/orders/{order_id}", authenticated=True)
