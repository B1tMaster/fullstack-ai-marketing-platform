import pytest
from unittest.mock import AsyncMock, patch
from asset_processing_service.models import AssetProcessingJob
from asset_processing_service.job_processor import process_job

@pytest.fixture
def mock_job():
    return AssetProcessingJob(
        id="test-job-123",
        assetId="test-asset-456",
        attempts=0
    )

@pytest.mark.asyncio
async def test_process_job_text_file(mock_job):
    """Test processing a text file"""
    with patch('asset_processing_service.job_processor.fetch_asset') as mock_fetch_asset, \
         patch('asset_processing_service.job_processor.update_job_details') as mock_update_job, \
         patch('asset_processing_service.job_processor.update_asset_content') as mock_update_content:
        
        # Mock the asset response
        mock_fetch_asset.return_value = AsyncMock(
            fileType="text",
            fileName="test.txt",
            mimeType="text/plain",
            size=100,
            fileUrl="http://example.com/test.txt",
            id="test-asset-456"
        )
        
        # Mock the file content
        mock_fetch_asset_file = AsyncMock(return_value=b"test content")
        
        await process_job(mock_job)
        
        # Verify the job was updated to in_progress
        mock_update_job.assert_any_call(
            mock_job.id,
            status="in_progress",
            attempts=1
        )
        
        # Verify the content was updated
        mock_update_content.assert_called_with(
            "test-asset-456",
            "test content"
        )
        
        # Verify the job was marked completed
        mock_update_job.assert_any_call(
            mock_job.id,
            status="completed"
        )
