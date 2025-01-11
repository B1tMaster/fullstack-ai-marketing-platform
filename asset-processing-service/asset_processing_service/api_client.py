from datetime import datetime
from typing import Optional, Dict, Any

import aiohttp
import tiktoken
from asset_processing_service.config import HEADERS, config
from asset_processing_service.models import Asset, AssetProcessingJob
from asset_processing_service.logging_config import (
    get_logger,
    log_error_with_context,
    configure_logging
)

# Get logger without configuring it (will use root logger config)
logger = logging.getLogger(__name__)


class ApiError(Exception):
    def __init__(self, message: str, status_code: int):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


async def fetch_jobs() -> list[AssetProcessingJob]:
    url = f"{config.API_BASE_URL.rstrip('/')}/asset-processing-job"
    logger.debug(f"Fetching jobs from URL: {url}")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=HEADERS) as response:
                if response.status == 200:
                    data = await response.json()
                    jobs = [AssetProcessingJob(**job) for job in data]
                    logger.info(f"Successfully fetched {len(jobs)} jobs")
                    return jobs
                else:
                    logger.warning(f"Failed to fetch jobs: HTTP {response.status}")
                    return []
    except Exception as e:
        log_error_with_context(
            logger,
            "Exception fetching jobs",
            e,
            {"url": url}
        )
        return []


async def update_job_details(
    job_id: str,
    *,
    status: Optional[str] = None,
    error_message: Optional[str] = None,
    attempts: Optional[int] = None,
    last_heartbeat: Optional[datetime] = None,
) -> bool:
    base_url = config.API_BASE_URL.rstrip("/")
    url = f"{base_url}/asset-processing-job/{job_id}"
    logger.debug(f"Updating job {job_id} at URL: {url}")

    update_data = {}
    if status is not None:
        update_data["status"] = status
    if error_message is not None:
        update_data["errorMessage"] = error_message
    if attempts is not None:
        update_data["attempts"] = attempts
    if last_heartbeat is not None:
        update_data["lastHeartBeat"] = last_heartbeat.isoformat()

    logger.debug(f"Update data: {update_data}")

    try:
        async with aiohttp.ClientSession() as session:
            async with session.patch(
                url, headers=HEADERS, json=update_data
            ) as response:
                response_text = await response.text()

                if response.status == 200:
                    logger.info(f"Successfully updated job {job_id}")
                    return True
                else:
                    logger.error(
                        "Failed to update job",
                        extra={
                            "status": response.status,
                            "url": url,
                            "response": response_text
                        }
                    )
                    return False
    except Exception as e:
        log_error_with_context(
            logger,
            "Exception updating job",
            e,
            {"url": url, "job_id": job_id}
        )
        return False


async def update_job_heartbeat(job_id: str) -> bool:
    if not job_id:
        logger.error("Job ID cannot be empty")
        return False

    base_url = config.API_BASE_URL.rstrip("/")
    url = f"{base_url}/asset-processing-job/{job_id}"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.patch(
                url, headers=HEADERS, json={"lastHeartBeat": datetime.now().isoformat()}
            ) as response:
                if response.status == 200:
                    return True
                else:
                    logger.warning(f"Failed to update heartbeat for job {job_id}")
                    return False
    except Exception as e:
        log_error_with_context(
            logger,
            "Exception updating heartbeat",
            e,
            {"job_id": job_id}
        )
        return False


async def fetch_asset(asset_id: str) -> Optional[Asset]:
    if not asset_id:
        logger.error("Asset ID cannot be empty")
        return None

    base_url = config.API_BASE_URL.rstrip("/")
    url = f"{base_url}/asset/{asset_id}"
    logger.debug(f"Fetching asset from URL: {url}")
    logger.debug(f"Using headers: {HEADERS}")

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=HEADERS) as response:
                print(f"Response status: {response.status}")
                if response.status == 200:
                    data = await response.json()
                    logger.debug(f"Response data: {data}")
                    return Asset(**data)
                else:
                    response_text = await response.text()
                    logger.error(
                        "Failed to fetch asset",
                        extra={
                            "status": response.status,
                            "response": response_text,
                            "asset_id": asset_id
                        }
                    )
                    return None
    except Exception as e:
        log_error_with_context(
            logger,
            "Exception fetching asset",
            e,
            {"asset_id": asset_id, "url": url}
        )
        return None


async def fetch_asset_file(file_url: str) -> bytes:
    """Fetch the asset file content from Vercel Blob storage.

    Args:
        file_url: The URL of the file in Vercel Blob storage

    Returns:
        The file content as bytes

    Raises:
        ApiError: If the file cannot be fetched, with status code 500
    """
    if not file_url:
        raise ApiError("File URL cannot be empty", 500)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(file_url) as response:
                if response.status == 200:
                    return await response.read()
                else:
                    error_msg = f"Failed to fetch file from {file_url}: {response.status}"
                    logger.error(error_msg)
                    raise ApiError(error_msg, 500)
    except Exception as e:
        error_msg = f"Exception fetching file from {file_url}: {e}"
        logger.error(error_msg)
        raise ApiError(error_msg, 500)


async def update_asset_content(asset_id: str, content: str) -> bool:
    """Update asset content and token count in the database.
    
    Args:
        asset_id: ID of the asset to update
        content: Content to update and tokenize
        
    Returns:
        bool: True if update was successful, False otherwise
    """
    if not asset_id:
        logger.error("Asset ID cannot be empty")
        return False

    if not content:
        logger.warning(f"Empty content provided for asset {asset_id}")
        content = ""

    # Initialize token count
    token_count = 0
    
    try:
        # Get encoding for GPT-4o
        encoding = tiktoken.encoding_for_model("gpt-4o")
        logger.debug(f"Successfully loaded encoding for GPT-4o")
        
        # Encode content and calculate token count
        tokens = encoding.encode(content)
        token_count = len(tokens)
        logger.info(f"Calculated token count: {token_count} for asset {asset_id}")
        
    except Exception as e:
        logger.error(f"Error calculating token count for asset {asset_id}: {str(e)}")
        # Continue with token_count = 0 if tokenization fails
        token_count = 0

    # Validate token count
    if not isinstance(token_count, int) or token_count < 0:
        logger.error(f"Invalid token count {token_count} for asset {asset_id}")
        token_count = 0

    base_url = config.API_BASE_URL.rstrip("/")
    url = f"{base_url}/asset/{asset_id}"
    logger.debug(f"Updating asset content at URL: {url}")

    try:
        async with aiohttp.ClientSession() as session:
            async with session.patch(
                url,
                headers=HEADERS,
                json={
                    "content": content,
                    "tokenCount": token_count
                }
            ) as response:
                logger.debug(f"Update response status: {response.status}")
                
                if response.status == 200:
                    logger.info(f"Successfully updated content and token count for asset {asset_id}")
                    return True
                else:
                    response_text = await response.text()
                    logger.error(
                        f"Failed to update asset content: Status {response.status}, "
                        f"Response: {response_text}"
                    )
                    return False
    except Exception as e:
        logger.error(f"Exception updating asset content: {str(e)}")
        return False
