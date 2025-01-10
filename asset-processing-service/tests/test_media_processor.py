import pytest
from unittest.mock import patch, AsyncMock
from asset_processing_service.media_processor import (
    convert_audio_file_to_mp3,
    split_audio_file,
    extract_audio_from_video_and_split,
    MediaProcessingError
)

@pytest.mark.asyncio
async def test_convert_audio_file_to_mp3_success():
    """Test successful audio file conversion"""
    with patch('asyncio.create_subprocess_exec') as mock_subprocess:
        # Mock successful subprocess execution
        mock_subprocess.return_value = AsyncMock(
            communicate=AsyncMock(return_value=(b"", b"")),
            returncode=0
        )
        
        result = await convert_audio_file_to_mp3("test.wav", "job-123")
        assert result.endswith(".mp3")

@pytest.mark.asyncio
async def test_convert_audio_file_to_mp3_failure():
    """Test failed audio file conversion"""
    with patch('asyncio.create_subprocess_exec') as mock_subprocess:
        # Mock failed subprocess execution
        mock_subprocess.return_value = AsyncMock(
            communicate=AsyncMock(return_value=(b"", b"error")),
            returncode=1
        )
        
        with pytest.raises(MediaProcessingError):
            await convert_audio_file_to_mp3("test.wav", "job-123")
