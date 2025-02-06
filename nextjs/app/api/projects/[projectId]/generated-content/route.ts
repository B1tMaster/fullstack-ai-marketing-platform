import { db } from "@/server/db";
import { generatedContentTable } from "@/server/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { HttpStatus } from "@/constants/http";
import { getAuth } from "@clerk/nextjs/server";

type Params = Promise<{ projectId: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const projectId = (await params).projectId;

  // Auth check
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatus.UNAUTHORIZED }
    );
  }

  try {
    const generatedContent = await db
      .select()
      .from(generatedContentTable)
      .where(eq(generatedContentTable.projectId, projectId))
      .orderBy(generatedContentTable.order);

    return NextResponse.json(generatedContent);
  } catch (error) {
    logger.error("Failed to fetch generated content", error, {
      projectId,
      component: 'generated-content-api'
    });
    return NextResponse.json(
      { error: "Failed to fetch generated content" },
      { status: 500 }
    );
  }
}
