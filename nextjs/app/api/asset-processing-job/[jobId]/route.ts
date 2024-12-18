import { db } from "@/server/db";
import { assetProcessingJobTable } from "@/server/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { HttpStatus } from "@/constants/http";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId;
    console.log(`Updating job ${jobId}`);

    const updateData = await request.json();
    console.log("Update data:", updateData);

    // Convert ISO string to Date for lastHeartBeat if it exists
    if (updateData.lastHeartBeat) {
      updateData.lastHeartBeat = new Date(updateData.lastHeartBeat);
    }

    const updatedJob = await db
      .update(assetProcessingJobTable)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(assetProcessingJobTable.id, jobId))
      .returning();

    if (!updatedJob || updatedJob.length === 0) {
      console.log(`Job ${jobId} not found`);
      return NextResponse.json(
        { error: "Job not found" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    console.log(`Successfully updated job ${jobId}`);
    return NextResponse.json(updatedJob[0]);
  } catch (error) {
    console.error("Failed to update job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
