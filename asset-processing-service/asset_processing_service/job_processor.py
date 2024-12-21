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

        if asset.fileType == "text" or asset.fileType == "markdown":
            print(f"Text file detected. Reading content of {asset.fileName}")
            content = file_buffer.decode("utf-8")
        elif asset.fileType == "audio":
            print(f"Processing audio file: {asset.fileName}")
            print("\nStage 1: Splitting audio file into chunks")
            audio_chunks = await split_audio_file(
                file_buffer,
                config.MAX_CHUNK_SIZE_BYTES,
                os.path.basename(asset.fileName),
                job.id,  # Pass the job ID for temp directory management
            )
            print(f"\nSuccessfully split audio file into {len(audio_chunks)} chunks")
            print("\nAudio chunks ready for next stage (transcription):")
            for chunk in audio_chunks:
                print(f"- {chunk['file_name']} ({chunk['size']} bytes)")

            # Store the audio chunks info as stage 1 output
            content = {
                "stage": "audio_splitting",
                "chunks": [
                    {"file_name": chunk["file_name"], "size": chunk["size"]}
                    for chunk in audio_chunks
                ],
                "num_chunks": len(audio_chunks),
                "total_size": sum(chunk["size"] for chunk in audio_chunks),
            }
            print("\nStoring stage 1 output:")
            print(content)

            # Update asset with stage 1 output
            if content is not None:
                print(f"\nUpdating asset {asset.id} with stage 1 output")
                await update_asset_content(asset.id, str(content))

            print(
                "\nStage 1 (audio splitting) complete. Keeping job in_progress for next stages:"
            )
            print("- Stage 2: Audio transcription")
            print("- Stage 3: Text processing")
            print("- Stage 4: Final processing")
            return  # Exit without updating status to completed
        elif asset.fileType == "video":
            print(f"Processing video file: {asset.fileName}")
            print("\nStage 1: Extracting audio and splitting into chunks")
            audio_chunks = await extract_audio_from_video_and_split(
                file_buffer,
                config.MAX_CHUNK_SIZE_BYTES,
                os.path.basename(asset.fileName),
                job.id,  # Pass the job ID for temp directory management
            )
            print(
                f"\nSuccessfully extracted and split audio into {len(audio_chunks)} chunks"
            )
            print("\nAudio chunks ready for next stage (transcription):")
            for chunk in audio_chunks:
                print(f"- {chunk['file_name']} ({chunk['size']} bytes)")

            # Store the audio chunks info as stage 1 output
            content = {
                "stage": "video_audio_extraction",
                "chunks": [
                    {"file_name": chunk["file_name"], "size": chunk["size"]}
                    for chunk in audio_chunks
                ],
                "num_chunks": len(audio_chunks),
                "total_size": sum(chunk["size"] for chunk in audio_chunks),
            }
            print("\nStoring stage 1 output:")
            print(content)

            # Update asset with stage 1 output
            if content is not None:
                print(f"\nUpdating asset {asset.id} with stage 1 output")
                await update_asset_content(asset.id, str(content))

            print(
                "\nStage 1 (audio extraction) complete. Keeping job in_progress for next stages:"
            )
            print("- Stage 2: Audio transcription")
            print("- Stage 3: Text processing")
            print("- Stage 4: Final processing")
            return  # Exit without updating status to completed
        else:
            raise ValueError(f"Unsupported content type: {asset.fileType}")

        # Update asset content if we have it
        if content is not None:
            print(f"\nUpdating content for asset {asset.id}")
            await update_asset_content(asset.id, content)

        # Update job status to completed
        print(f"\nMarking job {job.id} as completed")
        await update_job_details(job.id, status="completed")

        # Cancel heartbeat updater
        heartbeat_task.cancel()
        try:
            await heartbeat_task
        except asyncio.CancelledError:
            pass

    except Exception as e:
        print(f"Error processing job {job.id}: {str(e)}")
        await update_job_details(job.id, status="failed", error_message=str(e))
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
