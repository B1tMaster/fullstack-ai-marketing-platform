import { db } from "@/server/db";
import { assetProcessingJobTable } from "@/server/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ projectId: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const projectId = (await params).projectId;

  // Auth check
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobs = await db
      .select()
      .from(assetProcessingJobTable)
      .where(eq(assetProcessingJobTable.projectId, projectId))
      .execute();

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Failed to fetch asset processing jobs", error);
    return NextResponse.json(
      { error: "Failed to fetch asset processing jobs" },
      { status: 500 }
    );
  }
}
