import asyncio
from collections import defaultdict
from datetime import datetime

from asset_processing_service.api_client import fetch_jobs, update_job_details
from asset_processing_service.config import config
from asset_processing_service.constants.job_status import JobStatus
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
        print(log_message)


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
                print(f"Worker {worker_id} processing job {job.id}...")
                try:
                    await process_job(job)
                except Exception as e:
                    print(f"Error processing job {job.id}: {e}")
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
            print(f"Error in worker {worker_id}: {e}")
            await asyncio.sleep(3)


async def job_fetcher(job_queue: asyncio.Queue, jobs_pending_or_in_progress: set):
    while True:
        await asyncio.sleep(1)
        print("\nFetching jobs...", flush=True)

        try:
            jobs = await fetch_jobs()
            print(f"Fetched {len(jobs)} jobs", flush=True)
            if len(jobs) > 0:
                print("Job statuses:", [job.status for job in jobs])

            for job in jobs:
                print(f"\nProcessing job: {job.id}")
                print(f"Status: {job.status}")
                print(f"Attempts: {job.attempts}")
                print(f"In pending/progress: {job.id in jobs_pending_or_in_progress}")

                current_time = datetime.now().timestamp()
                last_heartbeat_time = job.lastHeartBeat.timestamp()
                time_since_last_heartbeat = abs(current_time - last_heartbeat_time)

                match job.status:
                    case "in_progress":
                        print(f"Job {job.id} is in progress")
                        print(
                            f"Time since last heartbeat: {time_since_last_heartbeat}s"
                        )
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
                    case "created" | "failed":
                        print(f"Job {job.id} is {job.status}")
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
                            print(
                                f"Adding job {job.id} to queue (attempts: {job.attempts})"
                            )
                            jobs_pending_or_in_progress.add(job.id)
                            await job_queue.put(job)
                            print(f"Job {job.id} added to queue")
                            print(f"Queue size now: {job_queue.qsize()}")
                            print(
                                f"Pending/progress jobs now: {jobs_pending_or_in_progress}"
                            )

                    case "max_attempts_exceeded":
                        print(f"Job {job.id} has exceeded max attempts")
                        remove_job_from_pending(
                            job.id, jobs_pending_or_in_progress, "Max attempts exceeded"
                        )
                    case _:
                        print(f"Job {job.id} has unknown status: {job.status}")

            print("\nFinished processing jobs")
            print(f"Jobs in pending/progress: {jobs_pending_or_in_progress}")
            print(f"Queue size: {job_queue.qsize()}")

            # Sleep after processing all jobs to avoid busy-waiting
            await asyncio.sleep(3)
        except Exception as e:
            print(f"Error in job fetcher: {e}", flush=True)
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
