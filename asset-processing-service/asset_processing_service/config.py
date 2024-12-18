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
    API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3000/api")
    STUCK_JOB_THRESHOLD_SECONDS = int(os.getenv("STUCK_JOB_THRESHOLD_SECONDS", "30"))
    MAX_JOB_ATTEMPTS = int(os.getenv("MAX_JOB_ATTEMPTS", "3"))
    MAX_NUM_WORKERS = int(os.getenv("MAX_NUM_WORKERS", "2"))


config = Config()

HEADERS = {"Authorization": f"Bearer {config.SERVER_API_KEY}"}
