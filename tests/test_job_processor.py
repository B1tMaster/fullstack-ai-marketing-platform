import pytest
from unittest.mock import patch, AsyncMock
from pathlib import Path

from ..job_processor import process_job
from ..models import AssetProcessingJob
from ..api_client import ApiError

# Test data paths
TEST_DATA_DIR = Path(__file__).parent.parent / "test_data"

@pytest.fixture
def mock_asset():
    """Fixture providing a mock Asset object"""
    return {
        "id": "test_asset",
        "fileName": "test_file.mp3",
        "fileType": "audio",
        "mimeType": "audio/mpeg",
        "size": 1024,
        "fileUrl": "http://example.com/test_file.mp3"
    }

@pytest.fixture
def mock_job():
    """Fixture providing a mock Job object"""
    return AssetProcessingJob(
        id="test_job",
        assetId="test_asset",
        status="pending",
        attempts=0
    )

@pytest.mark.asyncio
class TestJobProcessor:
    @pytest.mark.parametrize("file_type,filename", [
        ("audio", "valid_audio.mp3"),
        ("video", "valid_video.mp4"),
        ("text", "valid_text.txt"),
        ("markdown", "valid_markdown.md")
    ])
    async def test_process_job_success(self, file_type, filename, mock_job, mock_asset):
        """Test successful job processing for different file types"""
        mock_asset["fileType"] = file_type
        mock_asset["fileName"] = filename
        
        with patch('asset_processing_service.job_processor.fetch_asset', 
                  AsyncMock(return_value=mock_asset)), \
             patch('asset_processing_service.job_processor.fetch_asset_file',
                  AsyncMock(return_value=b"test content")), \
             patch('asset_processing_service.job_processor.update_job_details',
                  AsyncMock()) as mock_update:
            
            await process_job(mock_job)
            
            # Verify job status was updated
            mock_update.assert_called()
            assert mock_update.call_args[1]["status"] == "in_progress"

    async def test_process_job_failure(self, mock_job):
        """Test job processing failure when asset not found"""
        with patch('asset_processing_service.job_processor.fetch_asset', 
                  AsyncMock(return_value=None)), \
             pytest.raises(ValueError):
            
            await process_job(mock_job)

    async def test_process_job_api_error(self, mock_job, mock_asset):
        """Test job processing when API calls fail"""
        with patch('asset_processing_service.job_processor.fetch_asset',
                  AsyncMock(return_value=mock_asset)), \
             patch('asset_processing_service.job_processor.fetch_asset_file',
                  AsyncMock(side_effect=ApiError("API error", 500))), \
             patch('asset_processing_service.job_processor.update_job_details',
                  AsyncMock()) as mock_update:
            
            await process_job(mock_job)
            
            # Verify job was marked as failed
            mock_update.assert_called()
            assert mock_update.call_args[1]["status"] == "failed"
            assert "API error" in mock_update.call_args[1]["error_message"]

    async def test_process_job_cleanup(self, mock_job, mock_asset):
        """Test temporary files are cleaned up after job processing"""
        mock_asset["fileType"] = "audio"
        mock_asset["fileName"] = "valid_audio.mp3"
        
        with patch('asset_processing_service.job_processor.fetch_asset', 
                  AsyncMock(return_value=mock_asset)), \
             patch('asset_processing_service.job_processor.fetch_asset_file',
                  AsyncMock(return_value=b"test content")), \
             patch('asset_processing_service.job_processor.update_job_details',
                  AsyncMock()):
            
            await process_job(mock_job)
            
            # Verify temp directory was cleaned up
            temp_dir = Path(__file__).parent.parent / "asset_processing_service" / "temp" / "test_job"
            assert not temp_dir.exists()
