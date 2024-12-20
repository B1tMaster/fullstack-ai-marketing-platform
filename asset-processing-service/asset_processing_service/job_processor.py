import asyncio
import os

from asset_processing_service.api_client import (
    fetch_asset,
    fetch_asset_file,
    update_job_details,
    update_job_heartbeat,
)
from asset_processing_service.config import config
from asset_processing_service.media_processor import split_audio_file
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

        if asset.fileType == "text" or asset.fileType == "markdown":
            print(f"Text file detected. Reading content of {asset.fileName}")
            content = file_buffer.decode("utf-8")
        elif asset.fileType == "audio":
            print(f"Processing audio file: {asset.fileName}")
            chunks, mp3_files = await split_audio_file(
                file_buffer,
                config.MAX_CHUNK_SIZE_BYTES,
                os.path.basename(asset.fileName),
                job.id,  # Pass the job ID for temp directory management
            )
            print(f"\nSuccessfully split audio file into {len(chunks)} chunks")
            print("\nMP3 files ready for transcription:")
            for file_path in mp3_files:
                print(f"- {file_path}")

            # TODO: DELETE THIS TESTING CODE
            os.makedirs(os.path.expanduser("~/Downloads/audio"), exist_ok=True)
            for i, chunk in enumerate(chunks):
                chunk_path = os.path.join(
                    os.path.expanduser("~/Downloads/audio"), f"chunk_{i}.mp3"
                )
                with open(chunk_path, "wb") as f:
                    f.write(chunk)
                print(f"Wrote test chunk to file://{os.path.abspath(chunk_path)}")

            # transcribed_chunks = await transcribe_chunks(chunks)
            # content = "\n\n".join(transcribed_chunks)
        elif asset.fileType == "video":
            print(f"Video processing not implemented yet: {asset.fileName}")
            # chunks = await extract_audio_and_split()
            # transcribed_chunks = await transcribe_chunks(chunks)
            # content = "\n\n".join(transcribed_chunks)
            pass
        else:
            raise ValueError(f"Unsupported content type: {asset.fileType}")

        # TODO: update asset content

        # TODO: Update job status to completed
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
