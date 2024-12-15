from enum import Enum


class JobStatus(Enum):
    CREATED = "created"
    FAILED = "failed"
    IN_PROGRESS = "in_progress"
    STUCK = "stuck"
    MAX_ATTEMPTS_EXCEEDED = "max_attempts_exceeded"
