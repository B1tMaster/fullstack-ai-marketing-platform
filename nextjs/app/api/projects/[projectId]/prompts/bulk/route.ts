import { db } from "@/server/db";
import { promptsTable } from "@/server/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatus } from "@/constants/http";
import { z } from "zod";
import logger from "@/utils/logger";

const bulkPromptSchema = z.object({
  prompts: z.array(
    z.object({
      name: z.string(),
      prompt: z.string(),
      order: z.number(),
      tokenCount: z.number(),
    })
  ),
});

export type Params = Promise<{ projectId: string }>;

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  const projectId = (await params).projectId;
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    const body = await request.json();
    const parsed = bulkPromptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const inserted = await db.transaction(async (tx) => {
      const inserts = parsed.data.prompts.map((prompt) =>
        tx
          .insert(promptsTable)
          .values({
            ...prompt,
            projectId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
      );

      const results = await Promise.all(inserts);
      return results.flat();
    });

    return NextResponse.json({
      insertedCount: inserted.length,
    });
  } catch (error) {
    logger.error(
      "Failed to bulk insert prompts",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "bulkPromptsRoute",
        action: "POST",
        projectId,
      }
    );
    return NextResponse.json(
      { error: "Failed to bulk insert prompts" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
