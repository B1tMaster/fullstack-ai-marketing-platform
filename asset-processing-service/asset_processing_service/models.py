from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class AssetProcessingJob(BaseModel):
    id: str
    assetId: str
    status: Literal["created", "in_progress", "failed", "stuck"]
    attempts: int
    createdAt: datetime
    updatedAt: datetime
    lastHeartBeat: datetime
    errorMessage: Optional[str] = None
