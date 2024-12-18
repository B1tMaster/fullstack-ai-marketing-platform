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
    print(f"Processing job {job.id}...")

    heartbeat_task = asyncio.create_task(heeatbeat_updater(job.id))

    try:
        #  Update job status to "in_progress"
        await update_job_details(job.id, {"status": "in_progress"})

        # Fetch assset associated with asset processing job
        asset = await fetch_asset(job.assetId)
        if asset is None:
            raise ValueError(f"Asset with ID {job.assetId} not found")

        file_buffer = await fetch_asset_file(asset.fileUrl)

        content_type = "images"
        content = ""

        if content_type in ["text", "markdown"]:
            print(f"Text file detected. Ready content of {asset.fileName}")
            content = file_buffer.decode("utf-8")
        elif content_type == "audio":
            print("Processing audio file...")
            chunks = await split_audio_file(
                file_buffer,
                config.MAX_CHUNK_SIZE_BYTES,
                os.path.basename(asset.fileName),
            )
            transcribed_chunks = await transcribe_chunks(chunks)
            content = "\n\n".join(transcribed_chunks)
        elif content_type == "video":
            print("Processing video file...")
            chunks = await extract_audio_and_split()
            # transcribed_chunks = await transcribe_chunks(chunks)
            # content = "\n\n".join(transcribed_chunks)

        else:
            raise ValueError(f"Unsupported content type: {content_type}")

        # TODO: update asset content

        # TODO: Update job status to completed

        # TODO: Cancel heartbeat updater

    except Exception as e:
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
