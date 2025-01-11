import os
import logging

from asset_processing_service.constants.job_status import JobStatus
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()


def get_required_env_var(var_name: str) -> str:
    value = os.getenv(var_name)
    if not value:
        raise ValueError(f"Environment variable {var_name} is not set")
    return value.strip().strip("'\"")


class Config:
    SERVER_API_KEY = get_required_env_var("SERVER_API_KEY")
    API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3000")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "whisper-1")
    STUCK_JOB_THRESHOLD_SECONDS = int(os.getenv("STUCK_JOB_THRESHOLD_SECONDS", "30"))
    MAX_JOB_ATTEMPTS = int(os.getenv("MAX_JOB_ATTEMPTS", "3"))
    MAX_NUM_WORKERS = int(os.getenv("MAX_NUM_WORKERS", "2"))
    HEARTBEAT_INTERVAL_SECONDS = int(os.getenv("HEARTBEAT_INTERVAL_SECONDS", "10"))
    MAX_CHUNK_SIZE_BYTES = int(
        os.getenv("MAX_CHUNK_SIZE_BYTES", str(25 * 1024 * 1024))
    )  # Default 25MB
    MAX_TRANSCRIPTION_ATTEMPTS = int(os.getenv("MAX_TRANSCRIPTION_ATTEMPTS", "3"))
    MAX_TRANSCRIPTION_CONCURRENCY = int(os.getenv("MAX_TRANSCRIPTION_CONCURRENCY", "3"))

    # Validate and set TEMP_DIR
    _temp_dir = os.getenv(
        "TEMP_DIR", "/Users/davramenko/temp"
    )  # Default path if not set

    if not os.path.isabs(_temp_dir):
        raise ValueError(
            f"TEMP_DIR must be an absolute path. Got: {_temp_dir}\n"
            "Please provide a full path starting with '/'"
        )

    TEMP_DIR = _temp_dir.rstrip("/")  # Remove any trailing slashes
    logger.info(f"Temporary directory configured: {TEMP_DIR}")

    # Configure logging level
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
    valid_levels = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARNING": logging.WARNING,
        "ERROR": logging.ERROR,
        "CRITICAL": logging.CRITICAL
    }
    if LOG_LEVEL not in valid_levels:
        logger.warning(
            f"Invalid LOG_LEVEL '{LOG_LEVEL}' configured. "
            f"Must be one of {list(valid_levels.keys())}. Defaulting to INFO."
        )
        LOG_LEVEL = "INFO"
    else:
        LOG_LEVEL = valid_levels[LOG_LEVEL]

    # Create directory if it doesn't exist
    try:
        os.makedirs(TEMP_DIR, exist_ok=True)
        logger.info(f"Verified/created temporary directory: {TEMP_DIR}")
    except Exception as e:
        raise ValueError(
            f"Failed to create/verify temporary directory {TEMP_DIR}: {str(e)}"
        )


config = Config()

HEADERS = {"Authorization": f"Bearer {config.SERVER_API_KEY}"}
