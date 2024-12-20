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

    Args:
        input_path: Path to the input audio file
        job_id: ID of the job being processed (used for temp directory naming)

    Returns:
        Path to the converted MP3 file

    Raises:
        MediaProcessingError: If there's an error during conversion
    """
    try:
        # Create job-specific temp directory
        temp_dir = os.path.join(config.TEMP_DIR, job_id)
        os.makedirs(temp_dir, exist_ok=True)
        print(f"Created temp directory for job {job_id}:")
        print(f"file://{os.path.abspath(temp_dir)}")

        # Get the filename without extension
        base_name = Path(input_path).stem
        output_path = os.path.join(temp_dir, f"{base_name}.mp3")

        print(f"\nConverting audio file:")
        print(f"From: file://{os.path.abspath(input_path)}")
        print(f"To: file://{os.path.abspath(output_path)}")

        # Set up FFmpeg conversion
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
            print(error_msg)
            raise MediaProcessingError(error_msg)

        print(f"Successfully converted audio file to MP3.\nOutput file: {output_path}")
        return output_path

    except Exception as e:
        error_msg = f"Error converting audio file to MP3: {str(e)}"
        print(error_msg)
        raise MediaProcessingError(error_msg)


async def split_audio_file(
    file_buffer: bytes, max_chunk_size: int, original_filename: str, job_id: str
) -> Tuple[List[bytes], List[str]]:
    """Split an audio file into chunks of maximum size.

    Args:
        file_buffer: The audio file content as bytes
        max_chunk_size: Maximum size of each chunk in bytes (25MB)
        original_filename: Original filename to use as base for chunk names
        job_id: ID of the job being processed (used for temp directory naming)

    Returns:
        Tuple containing:
        - List of byte buffers containing the audio chunks
        - List of paths to the generated MP3 files

    Raises:
        MediaProcessingError: If there's an error processing the audio file
    """
    print(f"\n{'='*50}")
    print(f"Starting audio file processing for job {job_id}")
    print(f"Original filename: {original_filename}")
    print(f"Max chunk size: {max_chunk_size} bytes")
    print(f"Input buffer size: {len(file_buffer)} bytes")
    print(f"{'='*50}\n")

    temp_dir = os.path.join(config.TEMP_DIR, job_id)
    generated_files = []
    try:
        # Create job-specific temp directory
        os.makedirs(temp_dir, exist_ok=True)
        print(f"Using temp directory for job {job_id}:\n{temp_dir}")

        # Save the input buffer to a temporary file
        input_path = os.path.join(temp_dir, original_filename)
        with open(input_path, "wb") as f:
            f.write(file_buffer)
        print(f"Saved input file to:\n{input_path}")
        generated_files.append(input_path)

        # Convert to MP3 if needed
        if not original_filename.lower().endswith(".mp3"):
            print(f"Input file {original_filename} is not in MP3 format, converting...")
            input_path = await convert_audio_file_to_mp3(input_path, job_id)
            print(f"Using converted MP3 file:\n{input_path}")
            generated_files.append(input_path)

        # Get audio file information using ffprobe
        probe = ffmpeg.probe(input_path)
        duration = float(probe["format"]["duration"])
        print(f"Audio file duration: {duration} seconds")

        # Calculate chunk duration based on file size and max chunk size
        file_size = os.path.getsize(input_path)
        num_chunks = (file_size + max_chunk_size - 1) // max_chunk_size
        chunk_duration = duration / num_chunks
        print(
            f"File size: {file_size} bytes, splitting into {num_chunks} chunks of ~{max_chunk_size} bytes each"
        )

        chunks = []
        chunk_paths = []
        base_name = Path(original_filename).stem
        for i in range(num_chunks):
            chunk_path = os.path.join(temp_dir, f"{base_name}_chunk_{i}.mp3")
            start_time = i * chunk_duration

            # For the last chunk, use the remaining duration
            if i == num_chunks - 1:
                duration_arg = duration - start_time
            else:
                duration_arg = chunk_duration

            print(
                f"Creating chunk {i+1}/{num_chunks} from {start_time}s to {start_time + duration_arg}s"
            )

            # Split the audio file
            stream = ffmpeg.input(input_path, ss=start_time, t=duration_arg)
            stream = ffmpeg.output(stream, chunk_path, acodec="copy")
            process = await asyncio.create_subprocess_exec(
                *stream.compile(),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                error_msg = f"Error creating chunk {i}: {stderr.decode() if stderr else 'Unknown error'}"
                print(error_msg)
                raise MediaProcessingError(error_msg)

            # Verify chunk size
            chunk_size = os.path.getsize(chunk_path)
            if chunk_size > max_chunk_size:
                error_msg = (
                    f"Chunk {i} exceeds maximum size: {chunk_size} > {max_chunk_size}"
                )
                print(error_msg)
                raise MediaProcessingError(error_msg)

            # Read the chunk into memory and save its path
            with open(chunk_path, "rb") as f:
                chunks.append(f.read())
            chunk_paths.append(chunk_path)
            generated_files.append(chunk_path)

            print(
                f"Successfully created chunk {i+1} ({chunk_size} bytes):\n"
                f"file://{os.path.abspath(chunk_path)}"
            )

        print("\nGenerated MP3 files:")
        for file_path in generated_files:
            print(f"file://{os.path.abspath(file_path)}")

        return chunks, generated_files

    except ffmpeg.Error as e:
        error_msg = f"FFmpeg error processing {original_filename}: {e.stderr.decode() if e.stderr else str(e)}"
        print(error_msg)
        raise MediaProcessingError(error_msg)
    except Exception as e:
        error_msg = f"Error processing {original_filename}: {str(e)}"
        print(error_msg)
        raise MediaProcessingError(error_msg)
    finally:
        # Clean up only non-MP3 temporary files
        try:
            if os.path.exists(temp_dir):
                print("\nCleaning up temporary files (preserving MP3 files)...")
                for file in os.listdir(temp_dir):
                    file_path = os.path.join(temp_dir, file)
                    if file_path not in generated_files and not file.lower().endswith(
                        ".mp3"
                    ):
                        print(f"Removing temporary file: {file_path}")
                        os.remove(file_path)
        except Exception as e:
            print(f"Warning: Error cleaning up temporary files: {e}")


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
