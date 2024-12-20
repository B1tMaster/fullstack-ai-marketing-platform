from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class AssetProcessingJob(BaseModel):
    id: str
    assetId: str
    status: Literal[
        "created", "in_progress", "failed", "stuck", "max_attempts_exceeded"
    ]
    attempts: Optional[int] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    lastHeartBeat: Optional[datetime] = None
    errorMessage: Optional[str] = None


class Asset(BaseModel):
    id: str
    projectId: str
    title: str
    fileName: str
    fileUrl: str
    fileType: str
    mimeType: str
    size: int
    content: str = ""
    tokenCount: int = 0
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
