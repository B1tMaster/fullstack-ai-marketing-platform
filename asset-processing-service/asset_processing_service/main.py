import asyncio
from datetime import datetime

from asset_processing_service.api_client import fetch_jobs, update_job_details
from asset_processing_service.config import config
from asset_processing_service.constants.job_status import JobStatus


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
        print(log_message)


async def job_fetcher(job_queue: asyncio.Queue, jobs_pending_or_in_progress: set):
    while True:
        await asyncio.sleep(1)
        print("Fetching jobs", flush=True)

        try:
            jobs = await fetch_jobs()
            # print(f"Fetched jobs: {jobs}", flush=True)

            for job in jobs:
                current_time = datetime.now().timestamp()
                last_heartbeat_time = job.lastHeartBeat.timestamp()
                time_since_last_heartbeat = abs(current_time - last_heartbeat_time)

                match job.status:
                    case "in_progress":
                        if (
                            time_since_last_heartbeat
                            > config.STUCK_JOB_THRESHOLD_SECONDS
                            and job.attempts < config.MAX_JOB_ATTEMPTS
                        ):
                            print(f"Job {job.id} is stuck. Resetting job.")
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
                            print(f"Job {job.id} Updated in DB.")
                            print(f"Job {job.id} is still processing.")

                        if job.attempts >= config.MAX_JOB_ATTEMPTS:
                            print(
                                f"Job {job.id} has exceeded max attempts. Failing job."
                            )
                            await update_job_details(
                                job.id,
                                status=JobStatus.MAX_ATTEMPTS_EXCEEDED.value,
                                error_message="Max attempts exceeded",
                                attempts=job.attempts,
                            )
                            print(
                                f"Job {job.id} Updated in DB to max attempts exceeded."
                            )
                    case "created" | "failed":
                        if job.attempts >= config.MAX_JOB_ATTEMPTS:
                            print(
                                f"Job {job.id} has exceeded max attempts. Failing job."
                            )
                            await update_job_details(
                                job.id,
                                status=JobStatus.MAX_ATTEMPTS_EXCEEDED.value,
                                error_message="Max attempts exceeded",
                                attempts=job.attempts,
                            )
                        elif job.id not in jobs_pending_or_in_progress:
                            print("Adding job to queue: ", job.id)
                            jobs_pending_or_in_progress.add(job.id)
                            await job_queue.put(job)

                    case "max_attempts_exceeded":
                        remove_job_from_pending(
                            job.id, jobs_pending_or_in_progress, "Max attempts exceeded"
                        )

        except Exception as e:
            print(f"Error in job fetcher: {e}", flush=True)


async def async_main():
    job_queue = asyncio.Queue()
    jobs_pending_or_in_progress = set()

    job_fetcher_task = asyncio.create_task(
        job_fetcher(job_queue, jobs_pending_or_in_progress)
    )

    await asyncio.gather(job_fetcher_task)


def main():
    asyncio.run(async_main())


if __name__ == "__main__":
    main()
