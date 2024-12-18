from datetime import datetime
from typing import Optional

import aiohttp
from asset_processing_service.config import HEADERS, config
from asset_processing_service.models import AssetProcessingJob


async def fetch_jobs() -> list[AssetProcessingJob]:
    url = f"{config.API_BASE_URL}/asset-processing-job"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=HEADERS) as response:
                if response.status == 200:
                    data = await response.json()
                    return [AssetProcessingJob(**job) for job in data]
                else:
                    print(f"Failed to fetch jobs: {response.status}")
                    return []
    except Exception as e:
        print(f"Exception fetching jobs: {e}")
        return []


async def update_job_details(
    job_id: str,
    *,
    status: Optional[str] = None,
    error_message: Optional[str] = None,
    attempts: Optional[int] = None,
    last_heartbeat: Optional[datetime] = None,
) -> bool:
    # Ensure URL doesn't have double slashes and uses the correct endpoint
    base_url = config.API_BASE_URL.rstrip("/")
    url = f"{base_url}/asset-processing-job/{job_id}"
    print(f"Updating job {job_id} at URL: {url}")

    update_data = {}
    if status is not None:
        update_data["status"] = status
    if error_message is not None:
        update_data["errorMessage"] = error_message
    if attempts is not None:
        update_data["attempts"] = attempts
    if last_heartbeat is not None:
        update_data["lastHeartBeat"] = last_heartbeat.isoformat()

    print(f"Update data: {update_data}")

    try:
        async with aiohttp.ClientSession() as session:
            async with session.patch(
                url, headers=HEADERS, json=update_data
            ) as response:
                response_text = await response.text()

                if response.status == 200:
                    print(f"Successfully updated job {job_id}")
                    return True
                else:
                    print(
                        f"Failed to update job: Status {response.status}, "
                        f"URL: {url}, Response: {response_text}"
                    )
                    return False
    except Exception as e:
        print(f"Exception updating job: {e}, URL: {url}")
        return False
