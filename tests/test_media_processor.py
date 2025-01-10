import pytest
from pathlib import Path
from unittest.mock import patch, AsyncMock
import asyncio

from asset_processing_service.media_processor import (
    split_audio_file,
    convert_audio_file_to_mp3,
    extract_audio_from_video_and_split,
    MediaProcessingError
)

# Test data paths
TEST_DATA_DIR = Path(__file__).parent / "test_data"

@pytest.mark.asyncio
class TestAudioProcessing:
    @pytest.mark.parametrize("filename,expected_chunks", [
        ("valid_audio.mp3", 1),  # Small file, no splitting needed
        ("large_audio.mp3", 3),  # File that needs splitting
        ("non_mp3_audio.wav", 1)  # Needs conversion then splitting
    ])
    async def test_split_audio_file(self, filename, expected_chunks):
        """Test audio file splitting with various input files"""
        file_path = TEST_DATA_DIR / filename
        with open(file_path, "rb") as f:
            file_buffer = f.read()
        
        result = await split_audio_file(
            file_buffer=file_buffer,
            max_chunk_size=25 * 1024 * 1024,  # 25MB
            original_filename=filename,
            job_id="test_job"
        )
        
        assert len(result) == expected_chunks
        for chunk in result:
            assert isinstance(chunk, dict)
            assert "size" in chunk
            assert "file_name" in chunk
            assert "file_path" in chunk

    @pytest.mark.parametrize("filename,expected_error", [
        ("invalid_audio.mp3", "FFmpeg error"),
        ("empty_audio.mp3", "Output file is empty"),
        ("nonexistent.mp3", "No such file or directory")
    ])
    async def test_split_audio_file_errors(self, filename, expected_error):
        """Test error handling in audio file splitting"""
        file_path = TEST_DATA_DIR / filename
        with open(file_path, "rb") as f:
            file_buffer = f.read()
        
        with pytest.raises(MediaProcessingError) as exc_info:
            await split_audio_file(
                file_buffer=file_buffer,
                max_chunk_size=25 * 1024 * 1024,
                original_filename=filename,
                job_id="test_job"
            )
        
        assert expected_error in str(exc_info.value)

@pytest.mark.asyncio
class TestVideoProcessing:
    @pytest.mark.parametrize("filename,expected_chunks", [
        ("valid_video.mp4", 1),  # Small video, no splitting needed
        ("large_video.mp4", 3)   # Large video needing splitting
    ])
    async def test_extract_audio_from_video(self, filename, expected_chunks):
        """Test audio extraction from video files"""
        file_path = TEST_DATA_DIR / filename
        with open(file_path, "rb") as f:
            file_buffer = f.read()
        
        result = await extract_audio_from_video_and_split(
            file_buffer=file_buffer,
            max_chunk_size=25 * 1024 * 1024,
            original_filename=filename,
            job_id="test_job"
        )
        
        assert len(result) == expected_chunks

    @pytest.mark.parametrize("filename,expected_error", [
        ("invalid_video.mp4", "FFmpeg error"),
        ("video_no_audio.mp4", "No audio stream found"),
        ("empty_video.mp4", "Output file is empty")
    ])
    async def test_extract_audio_from_video_errors(self, filename, expected_error):
        """Test error handling in video processing"""
        file_path = TEST_DATA_DIR / filename
        with open(file_path, "rb") as f:
            file_buffer = f.read()
        
        with pytest.raises(MediaProcessingError) as exc_info:
            await extract_audio_from_video_and_split(
                file_buffer=file_buffer,
                max_chunk_size=25 * 1024 * 1024,
                original_filename=filename,
                job_id="test_job"
            )
        
        assert expected_error in str(exc_info.value)

@pytest.fixture(autouse=True)
def cleanup_temp_files():
    """Fixture to clean up any temporary files created during tests"""
    yield
    # Clean up code to remove any test-generated files
    temp_dir = Path(__file__).parent.parent / "asset_processing_service" / "temp" / "test_job"
    if temp_dir.exists():
        for f in temp_dir.glob("*"):
            f.unlink()
        temp_dir.rmdir()
