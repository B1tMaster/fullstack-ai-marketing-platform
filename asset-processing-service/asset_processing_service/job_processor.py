import asyncio
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

from asset_processing_service.api_client import (
    fetch_asset,
    fetch_asset_file,
    update_asset_content,
    update_job_details,
    update_job_heartbeat,
)
from asset_processing_service.config import config
from asset_processing_service.media_processor import (
    extract_audio_from_video_and_split,
    split_audio_file,
    transcribe_audio_file,
)
from asset_processing_service.models import AssetProcessingJob


async def process_job(job: AssetProcessingJob) -> None:
    print(f"\n{'='*50}")
    print(f"Processing job {job.id}...")
    print(f"Asset ID: {job.assetId}")
    print(f"{'='*50}\n")

    heartbeat_task = asyncio.create_task(heartbeat_updater(job.id))
    temp_files = []  # Track all temporary files
    temp_dir = os.path.join(config.TEMP_DIR, job.id)

    try:
        # Update job status to "in_progress" and increment attempts
        await update_job_details(
            job.id, status="in_progress", attempts=(job.attempts or 0) + 1
        )

        # Fetch asset associated with asset processing job
        print(f"Fetching asset details for ID: {job.assetId}")
        asset = await fetch_asset(job.assetId)
        if asset is None:
            raise ValueError(f"Asset with ID {job.assetId} not found")

        print(f"\nAsset details:")
        print(f"- File name: {asset.fileName}")
        print(f"- File type: {asset.fileType}")
        print(f"- MIME type: {asset.mimeType}")
        print(f"- Size: {asset.size} bytes\n")

        print(f"Processing asset: {asset.fileName}")
        print(f"File type: {asset.fileType}")
        print(f"MIME type: {asset.mimeType}")

        file_buffer = await fetch_asset_file(asset.fileUrl)
        content = None
        audio_chunks = None

        if asset.fileType == "text" or asset.fileType == "markdown":
            print(f"Text file detected. Reading content of {asset.fileName}")
            content = file_buffer.decode("utf-8")
            print(f"\nUpdating content for asset {asset.id}")
            await update_asset_content(asset.id, content)
            print(f"\nMarking job {job.id} as completed")
            await update_job_details(job.id, status="completed")
            
            # Clean up and cancel heartbeat before returning
            heartbeat_task.cancel()
            try:
                await heartbeat_task
            except asyncio.CancelledError:
                pass
            return  # Exit after completing text file processing
        elif asset.fileType == "audio":
            print(f"Processing audio file: {asset.fileName}")
            print("\nStage 1: Splitting audio file into chunks")
            chunk_paths = await split_audio_file(
                file_buffer,
                config.MAX_CHUNK_SIZE_BYTES,
                os.path.basename(asset.fileName),
                job.id,  # Pass the job ID for temp directory management
            )
            temp_files.extend(chunk_paths)  # Track temporary files
            print(f"\nSuccessfully split audio file into {len(chunk_paths)} chunks")
            print("\nAudio chunks ready for next stage (transcription):")
            for chunk_path in chunk_paths:
                chunk_size = os.path.getsize(chunk_path)
                print(f"- {os.path.basename(chunk_path)} ({chunk_size} bytes)")

            print("\nStage 1 (audio splitting) complete. Moving to next stages:")
            print("- Stage 2: Audio transcription")
            
            # Stage 2: Audio transcription
            print("\nStarting audio transcription...")
            try:
                logger.info(f"Starting transcription for {len(chunk_paths)} chunks")
                for chunk_path in chunk_paths:
                    if not os.path.exists(chunk_path):
                        logger.error(f"Chunk file missing: {chunk_path}")
                        raise FileNotFoundError(f"Chunk file missing: {chunk_path}")
                    logger.info(f"Chunk file exists: {chunk_path} ({os.path.getsize(chunk_path)} bytes)")
                
                transcription = await transcribe_audio_file(chunk_paths)
                if not transcription:
                    logger.error("Transcription returned empty result")
                    raise ValueError("Transcription returned empty result")
                print(f"\nSuccessfully transcribed audio. Transcription length: {len(transcription)} characters")
                print(f"Sample transcription: {transcription[:200]}...")  # Show first 200 chars
                
                # Stage 3: Update asset content with transcription
                print("\nUpdating asset content with transcription...")
                await update_asset_content(asset.id, transcription)
                
                # Stage 4: Mark job as completed
                print("\nMarking job as completed")
                await update_job_details(job.id, status="completed")
                return
            except Exception as e:
                print(f"Error during transcription: {str(e)}")
                raise
        elif asset.fileType == "video":
            print(f"Processing video file: {asset.fileName}")
            print("\nStage 1: Extracting audio and splitting into chunks")
            chunk_paths = await extract_audio_from_video_and_split(
                file_buffer,
                config.MAX_CHUNK_SIZE_BYTES,
                os.path.basename(asset.fileName),
                job.id,  # Pass the job ID for temp directory management
            )
            temp_files.extend(chunk_paths)  # Track temporary files
            print(
                f"\nSuccessfully extracted and split audio into {len(chunk_paths)} chunks"
            )
            print("\nAudio chunks ready for next stage (transcription):")
            for chunk_path in chunk_paths:
                print(f"- {os.path.basename(chunk_path)} ({os.path.getsize(chunk_path)} bytes)")

            print("\nStage 1 (audio extraction) complete. Moving to next stages:")
            
            # Stage 2: Audio transcription
            print("\nStarting audio transcription...")
            try:
                transcription = await transcribe_audio_file(chunk_paths)
                print(f"\nSuccessfully transcribed audio. Transcription length: {len(transcription)} characters")
                print(f"Sample transcription: {transcription[:200]}...")  # Show first 200 chars
                
                # Stage 3: Update asset content with transcription
                print("\nUpdating asset content with transcription...")
                await update_asset_content(asset.id, transcription)
                
                # Stage 4: Mark job as completed
                print("\nMarking job as completed")
                await update_job_details(job.id, status="completed")
                return
            except Exception as e:
                print(f"Error during transcription: {str(e)}")
                raise
        else:
            raise ValueError(f"Unsupported content type: {asset.fileType}")

        # Clean up all temporary files after successful completion
        if temp_files:
            print("\nCleaning up temporary files after successful completion")
            for file_path in temp_files:
                if os.path.exists(file_path):
                    print(f"Removing file: file://{os.path.abspath(file_path)}")
                    try:
                        os.remove(file_path)
                    except Exception as e:
                        logger.error(f"Error removing file {file_path}: {str(e)}")

            # Remove temp directory if empty
            if os.path.exists(temp_dir):
                try:
                    if not os.listdir(temp_dir):
                        print(
                            f"Removing empty temp directory: file://{os.path.abspath(temp_dir)}"
                        )
                        os.rmdir(temp_dir)
                    else:
                        logger.warning(f"Temp directory not empty: {temp_dir}")
                except Exception as e:
                    logger.error(f"Error removing temp directory {temp_dir}: {str(e)}")

        # Cancel heartbeat updater
        heartbeat_task.cancel()
        try:
            await heartbeat_task
        except asyncio.CancelledError:
            logger.info("Heartbeat task cancelled successfully")

    except Exception as e:
        print(f"Error processing job {job.id}: {str(e)}")
        await update_job_details(job.id, status="failed", error_message=str(e))

        # Clean up temporary files after failure
        if temp_files:
            print("\nCleaning up temporary files after job failure")
            for file_path in temp_files:
                if os.path.exists(file_path):
                    print(f"Removing file: file://{os.path.abspath(file_path)}")
                    os.remove(file_path)

            # Remove temp directory if empty
            if os.path.exists(temp_dir) and not os.listdir(temp_dir):
                print(
                    f"Removing empty temp directory: file://{os.path.abspath(temp_dir)}"
                )
                os.rmdir(temp_dir)

        heartbeat_task.cancel()
        try:
            await heartbeat_task
        except asyncio.CancelledError:
            pass


async def heartbeat_updater(job_id: str):
    while True:
        try:
            await update_job_heartbeat(job_id)
            await asyncio.sleep(config.HEARTBEAT_INTERVAL_SECONDS)
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error updating heartbeat for job {job_id}: {e}")
