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
                    # print("Raw API response:", data)
                    return [AssetProcessingJob(**job) for job in data]
                else:
                    print(f"Failed to fetch jobs: {response.status}")
                    return []
    except Exception as e:
        print(f"Exception fetching jobs: {e}")
        return []
