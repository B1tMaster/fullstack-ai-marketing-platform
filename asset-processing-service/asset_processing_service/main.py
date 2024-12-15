import asyncio

from asset_processing_service.api_client import fetch_jobs


async def job_fetcher(job_queue: asyncio.Queue, jobs_pending_or_in_progress: set):
    while True:
        await asyncio.sleep(1)
        print("Fetching jobs", flush=True)

        try:
            jobs = await fetch_jobs()
            print(f"Fetched jobs: {jobs}", flush=True)

            # Process each job that isn't already being handled
            for job in jobs:
                job_id = job.id

                # instructions in sudocode
                # use match python case statements to process all the jobs based on their status
                # print error messages when appropriate, make sure use best practices for error handling
                # if the job status is in_progress, do nothing
                # if the job status is created, add it to the job_queue and also add it to the jobs_pending_or_in_progress set
                # if the job status is failed and job.attempts >= config.MAX_JOB_ATTEMPTS, print the job details and message that it has exceeded the max attempts. update job status to max_attempts_exceeded and remove it from the jobs_pending_or_in_progress set
                # if the job status is stuck, set the job status to jobstatus.failed and remove it from the jobs_pending_or_in_progress set
                # if the job is max_attempts_exceeded, do nothing

                if job_id and job_id not in jobs_pending_or_in_progress:
                    jobs_pending_or_in_progress.add(job_id)
                    await job_queue.put(job)

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
