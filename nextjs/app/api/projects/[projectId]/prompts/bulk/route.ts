import { db } from "@/server/db";
import { promptsTable } from "@/server/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await request.json();
    const parsed = bulkPromptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
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
      { status: 500 }
    );
  }
}
