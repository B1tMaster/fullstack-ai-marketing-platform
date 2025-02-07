import { db } from "@/server/db";
import { templatePromptsTable } from "@/server/db/schema";
import { getPromptTokenCount } from "@/utils/tokenHelper";
import { getAuth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import logger from "@/utils/logger";
import { HttpStatus } from "@/constants/http";

const newPromptSchema = z.object({
  name: z.string().min(1, "Name is required"),
  prompt: z.string().optional(),
  order: z.number().int().nonnegative(),
  tokenCount: z.number().int().nonnegative().optional(),
});

const updatePromptSchema = newPromptSchema.extend({
  id: z.string().uuid(),
});

type Params = Promise<{ templateId: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const templateId = (await params).templateId;

  const { userId } = getAuth(request);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: HttpStatus.UNAUTHORIZED });

  try {
    const prompts = await db.query.templatePromptsTable.findMany({
      where: eq(templatePromptsTable.templateId, templateId),
      orderBy: templatePromptsTable.order,
    });
    return NextResponse.json(prompts);
  } catch (error) {
    logger.error(
      "Error fetching prompts",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "templatePromptsRoute",
        action: "GET",
        templateId,
      }
    );
    return NextResponse.json(
      { error: "Error fetching prompts" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  const templateId = (await params).templateId;

  const { userId } = getAuth(request);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: HttpStatus.UNAUTHORIZED });

  try {
    const json = await request.json();

    const parseResult = newPromptSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors },
        { status: HttpStatus.BAD_REQUEST }
      );
    }
    const { name, order, prompt } = parseResult.data;

    // Calculate token count
    const tokenCount = await getPromptTokenCount(prompt || "");

    const newPrompt = await db
      .insert(templatePromptsTable)
      .values({
        templateId,
        name,
        prompt,
        order,
        tokenCount: tokenCount,
      })
      .returning();

    return NextResponse.json(newPrompt[0], { status: HttpStatus.CREATED });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: HttpStatus.BAD_REQUEST });
    }
    logger.error(
      "Failed to create template prompt",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "templatePromptsRoute",
        action: "POST",
        templateId,
      }
    );
    return NextResponse.json(
      { error: "Failed to create template prompt" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const templateId = (await params).templateId;
  const { userId } = getAuth(request);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: HttpStatus.UNAUTHORIZED });

  const { searchParams } = new URL(request.url);
  const promptId = searchParams.get("id");

  if (!promptId) {
    return NextResponse.json(
      { error: "Prompt ID is required" },
      { status: HttpStatus.BAD_REQUEST }
    );
  }

  try {
    const deletedPrompt = await db
      .delete(templatePromptsTable)
      .where(
        and(
          eq(templatePromptsTable.id, promptId),
          eq(templatePromptsTable.templateId, templateId)
        )
      )
      .returning();

    if (deletedPrompt.length === 0) {
      return NextResponse.json({ error: "Prompt not found" }, { status: HttpStatus.NOT_FOUND });
    }

    return NextResponse.json({ message: "Prompt deleted successfully" });
  } catch (error) {
    logger.error(
      "Failed to delete template prompt",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "templatePromptsRoute",
        action: "DELETE",
        templateId,
        promptId,
      }
    );
    return NextResponse.json(
      { error: "Failed to delete template prompt" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  const templateId = (await params).templateId;

  const { userId } = getAuth(request);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: HttpStatus.UNAUTHORIZED });

  try {
    const json = await request.json();
    const prompt = updatePromptSchema.parse(json);

    const { id, name, prompt: promptText, order } = prompt;

    // Calculate token count
    const tokenCount = await getPromptTokenCount(promptText || "");

    const updatedPrompt = await db
      .update(templatePromptsTable)
      .set({
        name,
        prompt: promptText,
        order,
        tokenCount: tokenCount,
      })
      .where(
        and(
          eq(templatePromptsTable.id, id),
          eq(templatePromptsTable.templateId, templateId)
        )
      )
      .returning();

    if (updatedPrompt.length === 0) {
      return NextResponse.json(
        { error: `Prompt with id ${id} not found` },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    return NextResponse.json(updatedPrompt[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: HttpStatus.BAD_REQUEST });
    }
    logger.error(
      "Failed to update template prompt",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "templatePromptsRoute",
        action: "PATCH",
        templateId,
      }
    );
    return NextResponse.json(
      { error: "Failed to update template prompt" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
