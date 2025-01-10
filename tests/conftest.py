import pytest
from unittest.mock import patch
import asyncio

@pytest.fixture
def mock_config():
    """Fixture to mock configuration settings"""
    with patch('asset_processing_service.config.config') as mock_config:
        mock_config.TEMP_DIR = "temp"
        mock_config.MAX_CHUNK_SIZE_BYTES = 25 * 1024 * 1024  # 25MB
        mock_config.HEARTBEAT_INTERVAL_SECONDS = 5
        yield mock_config

@pytest.fixture(autouse=True)
def event_loop():
    """Fixture to ensure each test gets its own event loop"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
