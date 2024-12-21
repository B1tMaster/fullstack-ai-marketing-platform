import os

from asset_processing_service.constants.job_status import JobStatus
from dotenv import load_dotenv

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
    print(f"Temporary directory configured: {TEMP_DIR}")

    # Create directory if it doesn't exist
    try:
        os.makedirs(TEMP_DIR, exist_ok=True)
        print(f"Verified/created temporary directory: {TEMP_DIR}")
    except Exception as e:
        raise ValueError(
            f"Failed to create/verify temporary directory {TEMP_DIR}: {str(e)}"
        )


config = Config()

HEADERS = {"Authorization": f"Bearer {config.SERVER_API_KEY}"}
