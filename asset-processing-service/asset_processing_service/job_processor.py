import asyncio
import os

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
)
from asset_processing_service.models import AssetProcessingJob


async def process_job(job: AssetProcessingJob) -> None:
    print(f"\n{'='*50}")
    print(f"Processing job {job.id}...")
    print(f"Asset ID: {job.assetId}")
    print(f"{'='*50}\n")

    heartbeat_task = asyncio.create_task(heeatbeat_updater(job.id))
    temp_files = []  # Track all temporary files
    temp_dir = os.path.join(config.TEMP_DIR, job.id)

    try:
        # Update job status to "in_progress"
        await update_job_details(job.id, status="in_progress")

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
        elif asset.fileType == "audio":
            print(f"Processing audio file: {asset.fileName}")
            print("\nStage 1: Splitting audio file into chunks")
            audio_chunks, files = await split_audio_file(
                file_buffer,
                config.MAX_CHUNK_SIZE_BYTES,
                os.path.basename(asset.fileName),
                job.id,  # Pass the job ID for temp directory management
            )
            temp_files.extend(files)  # Track temporary files
            print(f"\nSuccessfully split audio file into {len(audio_chunks)} chunks")
            print("\nAudio chunks ready for next stage (transcription):")
            for chunk in audio_chunks:
                print(f"- {chunk['file_name']} ({chunk['size']} bytes)")

            print("\nStage 1 (audio splitting) complete. Moving to next stages:")
            print("- Stage 2: Audio transcription")
            print("- Stage 3: Text processing")
            print("- Stage 4: Final processing")

            # TODO: Pass audio_chunks to transcription stage
            # For now, mark as completed since we've done the first stage
            print(f"\nMarking job {job.id} as completed after audio splitting")
            await update_job_details(job.id, status="completed")
        elif asset.fileType == "video":
            print(f"Processing video file: {asset.fileName}")
            print("\nStage 1: Extracting audio and splitting into chunks")
            audio_chunks, files = await extract_audio_from_video_and_split(
                file_buffer,
                config.MAX_CHUNK_SIZE_BYTES,
                os.path.basename(asset.fileName),
                job.id,  # Pass the job ID for temp directory management
            )
            temp_files.extend(files)  # Track temporary files
            print(
                f"\nSuccessfully extracted and split audio into {len(audio_chunks)} chunks"
            )
            print("\nAudio chunks ready for next stage (transcription):")
            for chunk in audio_chunks:
                print(f"- {chunk['file_name']} ({chunk['size']} bytes)")

            print("\nStage 1 (audio extraction) complete. Moving to next stages:")
            print("- Stage 2: Audio transcription")
            print("- Stage 3: Text processing")
            print("- Stage 4: Final processing")

            # TODO: Pass audio_chunks to transcription stage
            # For now, mark as completed since we've done the first stage
            print(f"\nMarking job {job.id} as completed after audio extraction")
            await update_job_details(job.id, status="completed")
        else:
            raise ValueError(f"Unsupported content type: {asset.fileType}")

        # Update asset content if we have it
        if content is not None:
            print(f"\nUpdating content for asset {asset.id}")
            await update_asset_content(asset.id, content)
            print(f"\nMarking job {job.id} as completed after content update")
            await update_job_details(job.id, status="completed")

        # Clean up all temporary files after successful completion
        if temp_files:
            print("\nCleaning up temporary files after successful completion")
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

        # Cancel heartbeat updater
        heartbeat_task.cancel()
        try:
            await heartbeat_task
        except asyncio.CancelledError:
            pass

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


async def heeatbeat_updater(job_id: str):
    while True:
        try:
            await update_job_heartbeat(job_id)
            await asyncio.sleep(config.HEARTBEAT_INTERVAL_SECONDS)
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error updating heartbeat for job {job_id}: {e}")
