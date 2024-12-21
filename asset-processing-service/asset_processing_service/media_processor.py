import asyncio
import os
import tempfile
from pathlib import Path
from typing import List, Tuple

import ffmpeg
from asset_processing_service.config import config


class MediaProcessingError(Exception):
    """Custom exception for media processing errors"""

    pass


async def convert_audio_file_to_mp3(input_path: str, job_id: str) -> str:
    """Convert an audio file to MP3 format.

    This function creates a temporary directory for the job, converts the input audio file
    to MP3 format using ffmpeg, and returns the path to the converted file. The original
    file should be cleaned up by the caller.

    Args:
        input_path: Path to the input audio file
        job_id: ID of the job being processed (used for temp directory naming)

    Returns:
        Path to the converted MP3 file

    Raises:
        MediaProcessingError: If there's an error during conversion or file operations
    """
    print(f"\n{'='*20} Converting Audio File {'='*20}")
    print(f"Job ID: {job_id}")
    print(f"Input file: {input_path}")

    try:
        # Create job-specific temp directory
        temp_dir = os.path.join(config.TEMP_DIR, job_id)
        os.makedirs(temp_dir, exist_ok=True)
        print(f"Created/verified temp directory: file://{os.path.abspath(temp_dir)}")

        # Get the filename without extension
        base_name = Path(input_path).stem
        output_path = os.path.join(temp_dir, f"{base_name}.mp3")
        print(f"Will save converted file as: file://{os.path.abspath(output_path)}")

        # Set up FFmpeg conversion
        print("\nStarting FFmpeg conversion...")
        stream = ffmpeg.input(input_path)
        stream = ffmpeg.output(stream, output_path, acodec="libmp3lame", ab="192k")

        # Run the conversion asynchronously
        process = await asyncio.create_subprocess_exec(
            *stream.compile(),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            error_msg = f"FFmpeg conversion failed: {stderr.decode() if stderr else 'Unknown error'}"
            print(f"Error: {error_msg}")
            raise MediaProcessingError(error_msg)

        # Verify the output file exists and has size > 0
        if not os.path.exists(output_path):
            raise MediaProcessingError(
                f"Output file was not created: file://{os.path.abspath(output_path)}"
            )

        output_size = os.path.getsize(output_path)
        if output_size == 0:
            raise MediaProcessingError(
                f"Output file is empty: file://{os.path.abspath(output_path)}"
            )

        print(f"Successfully converted file to MP3")
        print(f"Output file: file://{os.path.abspath(output_path)}")
        print(f"Output file size: {output_size:,} bytes")
        print(f"{'='*60}\n")

        return output_path

    except Exception as e:
        error_msg = f"Error converting audio file to MP3: {str(e)}"
        print(f"Error: {error_msg}")
        print(f"{'='*60}\n")
        raise MediaProcessingError(error_msg)


async def split_audio_file(
    file_buffer: bytes, max_chunk_size: int, original_filename: str, job_id: str
) -> List[dict]:
    """Split an audio file into chunks of maximum size.

    This function processes an audio file by:
    1. Creating a temporary directory for the job
    2. Saving the input buffer to a temporary file
    3. Converting to MP3 format if needed
    4. Splitting the MP3 file into chunks of maximum size
    5. Reading chunks into memory
    6. Cleaning up all temporary files and directories

    The function maintains memory efficiency by:
    - Processing one chunk at a time
    - Deleting temporary files immediately after use
    - Cleaning up the temporary directory when done

    Args:
        file_buffer: The audio file content as bytes
        max_chunk_size: Maximum size of each chunk in bytes (25MB)
        original_filename: Original filename to use as base for chunk names
        job_id: ID of the job being processed (used for temp directory naming)

    Returns:
        List of dictionaries containing:
        - data: The chunk data as bytes
        - size: Size of the chunk in bytes
        - file_name: Name of the chunk file (zero-padded numbers to maintain order)

    Raises:
        MediaProcessingError: If there's an error during processing or file operations
    """
    print(f"\n{'='*20} Processing Audio File {'='*20}")
    print(f"Job ID: {job_id}")
    print(f"Original filename: {original_filename}")
    print(f"Max chunk size: {max_chunk_size:,} bytes")
    print(f"Input buffer size: {len(file_buffer):,} bytes")

    temp_dir = os.path.join(config.TEMP_DIR, job_id)
    audio_chunks = []
    input_path = None
    converted_path = None

    try:
        # Step 1: Create job-specific temp directory
        print(f"\nStep 1: Creating temporary directory")
        os.makedirs(temp_dir, exist_ok=True)
        print(f"Created/verified temp directory: file://{os.path.abspath(temp_dir)}")

        # Step 2: Save input buffer to temporary file
        print(f"\nStep 2: Saving input buffer to temporary file")
        input_path = os.path.join(temp_dir, original_filename)
        with open(input_path, "wb") as f:
            f.write(file_buffer)
        print(f"Saved input file: file://{os.path.abspath(input_path)}")
        print(f"Input file size: {os.path.getsize(input_path):,} bytes")

        # Step 3: Convert to MP3 if needed
        working_path = input_path
        if not original_filename.lower().endswith(".mp3"):
            print(f"\nStep 3: Converting to MP3 format")
            converted_path = await convert_audio_file_to_mp3(input_path, job_id)
            working_path = converted_path
            print(f"Deleting original file: file://{os.path.abspath(input_path)}")
            os.remove(input_path)
            input_path = None
        else:
            print(f"\nStep 3: File is already in MP3 format, skipping conversion")

        # Step 4: Get audio information
        print(f"\nStep 4: Analyzing audio file")
        probe = ffmpeg.probe(working_path)
        _validate_audio_file(probe, original_filename)
        duration = float(probe["format"]["duration"])
        file_size = os.path.getsize(working_path)
        print(f"Audio file: file://{os.path.abspath(working_path)}")
        print(f"Audio duration: {duration:.2f} seconds")
        print(f"File size: {file_size:,} bytes")

        # Log audio details
        print(f"Audio details:")
        print(f"- Format: {probe['format']['format_name']}")
        for stream in probe["streams"]:
            if stream["codec_type"] == "audio":
                print(f"- Codec: {stream.get('codec_name', 'unknown')}")
                print(f"- Channels: {stream.get('channels', 'unknown')}")
                print(f"- Sample rate: {stream.get('sample_rate', 'unknown')} Hz")
                print(f"- Bit rate: {stream.get('bit_rate', 'unknown')} bps")

        # Step 5: Calculate chunks
        num_chunks = (file_size + max_chunk_size - 1) // max_chunk_size
        chunk_duration = duration / num_chunks
        print(f"\nStep 5: Splitting into {num_chunks} chunks")
        print(f"Approximate chunk duration: {chunk_duration:.2f} seconds")

        # Step 6: Process chunks
        print(f"\nStep 6: Processing chunks")
        base_name = Path(original_filename).stem
        for i in range(num_chunks):
            chunk_file_name = f"{base_name}_chunk_{i:03d}.mp3"  # Zero-padded numbers
            chunk_path = os.path.join(temp_dir, chunk_file_name)
            start_time = i * chunk_duration
            duration_arg = (
                duration - start_time if i == num_chunks - 1 else chunk_duration
            )

            print(f"\nProcessing chunk {i+1}/{num_chunks}")
            print(f"Time range: {start_time:.2f}s to {start_time + duration_arg:.2f}s")
            print(f"Output path: file://{os.path.abspath(chunk_path)}")

            # Extract chunk using ffmpeg
            stream = ffmpeg.input(working_path, ss=start_time, t=duration_arg)
            stream = ffmpeg.output(stream, chunk_path, acodec="copy")
            process = await asyncio.create_subprocess_exec(
                *stream.compile(),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                error_msg = f"Error creating chunk {i}: {stderr.decode() if stderr else 'Unknown error'}"
                print(f"Error: {error_msg}")
                raise MediaProcessingError(error_msg)

            # Verify chunk size
            chunk_size = os.path.getsize(chunk_path)
            if chunk_size > max_chunk_size:
                error_msg = f"Chunk {i} exceeds maximum size: {chunk_size:,} > {max_chunk_size:,}"
                print(f"Error: {error_msg}")
                raise MediaProcessingError(error_msg)

            # Read chunk and clean up
            print(f"Reading chunk into memory: file://{os.path.abspath(chunk_path)}")
            with open(chunk_path, "rb") as f:
                chunk_data = f.read()
            print(
                f"Deleting temporary chunk file: file://{os.path.abspath(chunk_path)}"
            )
            os.remove(chunk_path)

            audio_chunks.append(
                {
                    "data": chunk_data,
                    "size": chunk_size,
                    "file_name": chunk_file_name,
                }
            )
            print(f"Chunk {i+1} processed: {chunk_size:,} bytes")

        print(f"\nSuccessfully processed all {len(audio_chunks)} chunks")
        print(
            f"Total data size: {sum(chunk['size'] for chunk in audio_chunks):,} bytes"
        )

        return audio_chunks

    except ffmpeg.Error as e:
        error_msg = f"FFmpeg error processing {original_filename}: {e.stderr.decode() if e.stderr else str(e)}"
        print(f"Error: {error_msg}")
        raise MediaProcessingError(error_msg)
    except Exception as e:
        error_msg = f"Error processing {original_filename}: {str(e)}"
        print(f"Error: {error_msg}")
        raise MediaProcessingError(error_msg)
    finally:
        # Clean up all temporary files and directory
        print(f"\nCleaning up temporary files and directory")
        try:
            if input_path and os.path.exists(input_path):
                print(f"Removing input file: {input_path}")
                os.remove(input_path)
            if converted_path and os.path.exists(converted_path):
                print(f"Removing converted file: {converted_path}")
                os.remove(converted_path)
            if os.path.exists(temp_dir):
                if not os.listdir(temp_dir):
                    print(f"Removing empty temp directory: {temp_dir}")
                    os.rmdir(temp_dir)
                else:
                    print(
                        f"Warning: Temp directory not empty, files remaining in {temp_dir}:"
                    )
                    for file in os.listdir(temp_dir):
                        print(f"- {file}")
        except Exception as e:
            print(f"Warning: Error during cleanup: {e}")

        print(f"{'='*60}\n")


# Stub methods for other file types
async def process_text_file(file_buffer: bytes, filename: str) -> str:
    print(f"Text file processing is not implemented yet: {filename}")
    return ""


async def process_image_file(file_buffer: bytes, filename: str) -> str:
    print(f"Image file processing is not implemented yet: {filename}")
    return ""


async def process_video_file(file_buffer: bytes, filename: str) -> str:
    print(f"Video file processing is not implemented yet: {filename}")
    return ""


def _validate_audio_file(probe_data: dict, filename: str) -> None:
    """Validate that the file contains an audio stream.

    Args:
        probe_data: FFprobe data
        filename: Original filename for error messages

    Raises:
        MediaProcessingError: If no audio stream is found
    """
    if not any(stream["codec_type"] == "audio" for stream in probe_data["streams"]):
        raise MediaProcessingError(f"No audio stream found in file: {filename}")


def _validate_video_file(probe_data: dict, filename: str) -> None:
    """Validate that the file contains a video stream.

    Args:
        probe_data: FFprobe data
        filename: Original filename for error messages

    Raises:
        MediaProcessingError: If no video stream is found
    """
    if not any(stream["codec_type"] == "video" for stream in probe_data["streams"]):
        raise MediaProcessingError(f"No video stream found in file: {filename}")


async def extract_audio_from_video_and_split(
    file_buffer: bytes, max_chunk_size: int, original_filename: str, job_id: str
) -> List[dict]:
    """Extract audio from a video file and split it into chunks.

    This function processes a video file by:
    1. Creating a temporary directory for the job
    2. Saving the input buffer to a temporary file
    3. Validating the video file format
    4. Extracting the audio track to MP3 format
    5. Splitting the MP3 file into chunks of maximum size
    6. Cleaning up all temporary files and directories

    The function maintains memory efficiency by:
    - Processing one chunk at a time
    - Deleting temporary files immediately after use
    - Cleaning up the temporary directory when done

    Args:
        file_buffer: The video file content as bytes
        max_chunk_size: Maximum size of each chunk in bytes (25MB)
        original_filename: Original filename to use as base for chunk names
        job_id: ID of the job being processed (used for temp directory naming)

    Returns:
        List of dictionaries containing:
        - data: The chunk data as bytes
        - size: Size of the chunk in bytes
        - file_name: Name of the chunk file (zero-padded numbers to maintain order)

    Raises:
        MediaProcessingError: If there's an error during processing or file operations
    """
    print(f"\n{'='*20} Processing Video File {'='*20}")
    print(f"Job ID: {job_id}")
    print(f"Original filename: {original_filename}")
    print(f"Input buffer size: {len(file_buffer):,} bytes")

    temp_dir = os.path.join(config.TEMP_DIR, job_id)
    input_path = None
    audio_path = None

    try:
        # Step 1: Create job-specific temp directory
        print(f"\nStep 1: Creating temporary directory")
        os.makedirs(temp_dir, exist_ok=True)
        print(f"Created/verified temp directory: file://{os.path.abspath(temp_dir)}")

        # Step 2: Save input buffer to temporary file
        print(f"\nStep 2: Saving input buffer to temporary file")
        input_path = os.path.join(temp_dir, original_filename)
        with open(input_path, "wb") as f:
            f.write(file_buffer)
        print(f"Saved input file: file://{os.path.abspath(input_path)}")
        print(f"Input file size: {os.path.getsize(input_path):,} bytes")

        # Step 3: Validate video file
        print(f"\nStep 3: Validating video file")
        probe = ffmpeg.probe(input_path)
        _validate_video_file(probe, original_filename)

        # Log video details
        duration = float(probe["format"]["duration"])
        print(f"Video details:")
        print(f"Video file: file://{os.path.abspath(input_path)}")
        print(f"- Duration: {duration:.2f} seconds")
        print(f"- Format: {probe['format']['format_name']}")
        for stream in probe["streams"]:
            if stream["codec_type"] == "video":
                print(f"- Video codec: {stream.get('codec_name', 'unknown')}")
            elif stream["codec_type"] == "audio":
                print(f"- Audio codec: {stream.get('codec_name', 'unknown')}")

        # Step 4: Extract audio track
        print(f"\nStep 4: Extracting audio track")
        base_name = Path(original_filename).stem
        audio_path = os.path.join(temp_dir, f"{base_name}.mp3")
        print(f"Will extract audio to: file://{os.path.abspath(audio_path)}")

        # Extract audio using ffmpeg
        stream = ffmpeg.input(input_path)
        stream = ffmpeg.output(
            stream, audio_path, vn=None, acodec="libmp3lame", ab="192k"  # No video
        )

        print("Starting FFmpeg audio extraction...")
        process = await asyncio.create_subprocess_exec(
            *stream.compile(),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            error_msg = f"FFmpeg audio extraction failed: {stderr.decode() if stderr else 'Unknown error'}"
            print(f"Error: {error_msg}")
            raise MediaProcessingError(error_msg)

        print(f"Successfully extracted audio to: file://{os.path.abspath(audio_path)}")
        print(f"Audio file size: {os.path.getsize(audio_path):,} bytes")

        # Clean up video file as we don't need it anymore
        print(f"Removing video file: file://{os.path.abspath(input_path)}")
        os.remove(input_path)
        input_path = None

        # Step 5: Split audio into chunks
        print(f"\nStep 5: Splitting audio into chunks")
        with open(audio_path, "rb") as f:
            audio_buffer = f.read()

        # Use existing split_audio_file function
        audio_chunks = await split_audio_file(
            audio_buffer, max_chunk_size, os.path.basename(audio_path), job_id
        )

        return audio_chunks

    except ffmpeg.Error as e:
        error_msg = f"FFmpeg error processing {original_filename}: {e.stderr.decode() if e.stderr else str(e)}"
        print(f"Error: {error_msg}")
        raise MediaProcessingError(error_msg)
    except Exception as e:
        error_msg = f"Error processing {original_filename}: {str(e)}"
        print(f"Error: {error_msg}")
        raise MediaProcessingError(error_msg)
    finally:
        # Clean up all temporary files and directory
        print(f"\nCleaning up temporary files and directory")
        try:
            if input_path and os.path.exists(input_path):
                print(f"Removing input file: {input_path}")
                os.remove(input_path)
            if audio_path and os.path.exists(audio_path):
                print(f"Removing extracted audio file: {audio_path}")
                os.remove(audio_path)
            if os.path.exists(temp_dir):
                if not os.listdir(temp_dir):
                    print(f"Removing empty temp directory: {temp_dir}")
                    os.rmdir(temp_dir)
                else:
                    print(
                        f"Warning: Temp directory not empty, files remaining in {temp_dir}:"
                    )
                    for file in os.listdir(temp_dir):
                        print(f"- {file}")
        except Exception as e:
            print(f"Warning: Error during cleanup: {e}")

        print(f"{'='*60}\n")
