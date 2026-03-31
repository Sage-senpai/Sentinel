"""Application configuration via environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration — all values come from env vars."""

    # General
    environment: str = "development"
    debug: bool = True
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # Database
    database_url: str = "postgresql+asyncpg://sentinel:sentinel@localhost:5432/sentinel_dev"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Pacifica
    pacifica_api_url: str = "https://test-api.pacifica.fi/api/v1"
    pacifica_ws_url: str = "wss://test-ws.pacifica.fi"
    pacifica_api_key: str = ""
    pacifica_api_secret: str = ""

    # Sponsor APIs
    elfa_api_key: str = ""
    privy_app_secret: str = ""
    fuul_api_key: str = ""
    coingecko_api_key: str = ""
    rhinofi_api_key: str = ""

    # Agent toggles
    agent_guard_enabled: bool = True
    agent_cascade_enabled: bool = True
    agent_whale_enabled: bool = True
    agent_funding_enabled: bool = True
    agent_africa_enabled: bool = True
    agent_broadcast_enabled: bool = True

    # Contract
    alert_registry_address: str = ""
    deployer_private_key: str = ""
    arbitrum_rpc_url: str = "https://arb1.arbitrum.io/rpc"

    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()
