import asyncio
from collections import defaultdict
from datetime import datetime
import logging
from asset_processing_service.logging_config import configure_logging
from asset_processing_service.config import config

# Configure logging using centralized configuration
configure_logging(config.LOG_LEVEL)
logger = logging.getLogger(__name__)

from asset_processing_service.api_client import fetch_jobs, update_job_details
from asset_processing_service.config import config
from asset_processing_service.constants.job_status import JobStatus
from asset_processing_service.models import AssetProcessingJob
from asset_processing_service.job_processor import process_job


def remove_job_from_pending(
    job_id: str, jobs_pending_or_in_progress: set, reason: str = ""
) -> None:
    """Remove a job from the pending or in progress set and log the action.

    Args:
        job_id: The ID of the job to remove
        jobs_pending_or_in_progress: The set containing pending/in-progress jobs
        reason: Optional reason for removal for logging purposes
    """
    if job_id in jobs_pending_or_in_progress:
        jobs_pending_or_in_progress.remove(job_id)
        log_message = f"Job {job_id} removed from pending or in progress set"
        if reason:
            log_message += f". Reason: {reason}"
        logger.info(log_message)


async def worker(
    worker_id: int,
    job_queue: asyncio.Queue,
    jobs_pending_or_in_progress: set,
    job_locks: dict,
):
    while True:
        try:
            job = await job_queue.get()

            async with job_locks[job.id]:
                logger.info(f"Worker {worker_id} processing job {job.id}...")
                try:
                    await process_job(job)
                except Exception as e:
                    logger.error(f"Error processing job {job.id}: {e}")
                    error_message = str(e)
                    await update_job_details(
                        job_id=job.id,
                        status="failed",
                        error_message=error_message,
                        attempts=job.attempts + 1,
                    )
                finally:
                    jobs_pending_or_in_progress.remove(job.id)
                    job_locks.pop(job.id, None)

            job_queue.task_done()
        except Exception as e:
            logger.error(f"Error in worker {worker_id}: {e}")
            await asyncio.sleep(3)


async def job_fetcher(job_queue: asyncio.Queue, jobs_pending_or_in_progress: set):
    while True:
        await asyncio.sleep(1)
        logger.info("\nFetching jobs...")

        try:
            # Fetch jobs and filter out any with MAX_ATTEMPTS_EXCEEDED status
            all_jobs = await fetch_jobs()
            jobs = [job for job in all_jobs if job.status != JobStatus.MAX_ATTEMPTS_EXCEEDED.value]
            
            logger.info(f"Fetched {len(all_jobs)} jobs, {len(jobs)} after filtering")
            if len(all_jobs) > 0:
                logger.debug("Job statuses: %s", [job.status for job in all_jobs])

            for job in jobs:
                logger.info(f"\nProcessing job: {job.id}")
                logger.info(f"Status: {job.status}")
                logger.info(f"Attempts: {job.attempts}")
                logger.info(f"In pending/progress: {job.id in jobs_pending_or_in_progress}")

                current_time = datetime.now().timestamp()
                last_heartbeat_time = job.lastHeartBeat.timestamp()
                time_since_last_heartbeat = abs(current_time - last_heartbeat_time)

                match job.status:
                    case JobStatus.IN_PROGRESS.value:
                        logger.info(f"Job {job.id} is in progress")
                        logger.info(f"Time since last heartbeat: {time_since_last_heartbeat}s")
                        if (
                            time_since_last_heartbeat
                            > config.STUCK_JOB_THRESHOLD_SECONDS
                            and job.attempts < config.MAX_JOB_ATTEMPTS
                        ):
                            logger.warning(f"Job {job.id} is stuck. Resetting job.")
                            remove_job_from_pending(
                                job.id, jobs_pending_or_in_progress, "Job is stuck"
                            )

                            await update_job_details(
                                job.id,
                                status=JobStatus.STUCK.value,
                                error_message="Job is stuck",
                                attempts=job.attempts + 1,
                                last_heartbeat=datetime.now(),
                            )
                            logger.info(f"Job {job.id} Updated in DB.")

                        if job.attempts >= config.MAX_JOB_ATTEMPTS:
                            logger.warning(f"Job {job.id} has exceeded max attempts. Failing job.")
                            await update_job_details(
                                job.id,
                                status=JobStatus.MAX_ATTEMPTS_EXCEEDED.value,
                                error_message="Max attempts exceeded",
                                attempts=job.attempts,
                            )
                    case JobStatus.CREATED.value | JobStatus.FAILED.value:
                        logger.info(f"Job {job.id} is {job.status}")
                        if job.attempts >= config.MAX_JOB_ATTEMPTS:
                            logger.warning(f"Job {job.id} has exceeded max attempts. Failing job.")
                            await update_job_details(
                                job.id,
                                status=JobStatus.MAX_ATTEMPTS_EXCEEDED.value,
                                error_message="Max attempts exceeded",
                                attempts=job.attempts,
                            )
                        elif job.id not in jobs_pending_or_in_progress:
                            logger.info(f"Adding job {job.id} to queue (attempts: {job.attempts})")
                            jobs_pending_or_in_progress.add(job.id)
                            await job_queue.put(job)
                            logger.info(f"Job {job.id} added to queue")
                            logger.debug(f"Queue size now: {job_queue.qsize()}")
                            logger.debug(f"Pending/progress jobs now: {jobs_pending_or_in_progress}")

                    case JobStatus.MAX_ATTEMPTS_EXCEEDED.value:
                        logger.warning(f"Job {job.id} has exceeded max attempts")
                        remove_job_from_pending(
                            job.id, jobs_pending_or_in_progress, "Max attempts exceeded"
                        )
                        # Skip processing and continue to next job
                        continue
                    case JobStatus.STUCK.value:
                        logger.warning(f"Job {job.id} is stuck")
                        remove_job_from_pending(
                            job.id, jobs_pending_or_in_progress, "Job is stuck"
                        )
                    case _:
                        logger.warning(f"Job {job.id} has unknown status: {job.status}")

            logger.info("\nFinished processing jobs")
            logger.debug(f"Jobs in pending/progress: {jobs_pending_or_in_progress}")
            logger.debug(f"Queue size: {job_queue.qsize()}")

            # Sleep after processing all jobs to avoid busy-waiting
            await asyncio.sleep(3)
        except Exception as e:
            logger.error(f"Error in job fetcher: {e}")
            await asyncio.sleep(3)


async def async_main():
    job_queue = asyncio.Queue()
    jobs_pending_or_in_progress = set()
    job_locks = defaultdict(asyncio.Lock)

    job_fetcher_task = asyncio.create_task(
        job_fetcher(job_queue, jobs_pending_or_in_progress)
    )

    workers = [
        asyncio.create_task(
            worker(i + 1, job_queue, jobs_pending_or_in_progress, job_locks)
        )
        for i in range(config.MAX_NUM_WORKERS)
    ]

    await asyncio.gather(job_fetcher_task, *workers)


def main():
    asyncio.run(async_main())


if __name__ == "__main__":
    main()
