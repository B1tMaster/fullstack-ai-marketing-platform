import { db } from "@/server/db";
import { assetProcessingJobTable } from "@/server/db/schema";
import { NextResponse } from "next/server";
import { not, eq } from "drizzle-orm";
import { HttpStatus } from "@/constants/http";

export async function GET() {
  console.log("Fetching asset processing jobs");

  try {
    const jobs = await db
      .select()
      .from(assetProcessingJobTable)
      .where(not(eq(assetProcessingJobTable.status, "completed")))
      .execute();

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Failed to fetch asset processing jobs", error);
    return NextResponse.json(
      { error: "Failed to fetch asset processing jobs" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
