import { db } from "@/server/db";
import { promptsTable } from "@/server/db/schema";
import { auth, getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

const newPromptSchema = z.object({
  name: z.string().default("New Prompt"),
  prompt: z.string().default(""),
  order: z.number().default(0),
  tokenCount: z.number().default(0),
});

type Params = Promise<{ projectId: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = (await params).projectId;

    const prompts = await db
      .select()
      .from(promptsTable)
      .where(and(eq(promptsTable.projectId, projectId)))
      .orderBy(promptsTable.order);

    return NextResponse.json(prompts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; promptId: string } }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = params;
    const { promptId } = await request.json();

    if (!promptId) {
      return NextResponse.json(
        { error: "promptId is required" },
        { status: 400 }
      );
    }

    await db
      .delete(promptsTable)
      .where(
        and(
          eq(promptsTable.id, promptId),
          eq(promptsTable.projectId, projectId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string; promptId: string } }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = params;
    const { promptId, prompt: newPrompt } = await request.json();

    if (!promptId || !newPrompt) {
      return NextResponse.json(
        { error: "promptId and prompt are required" },
        { status: 400 }
      );
    }

    // Calculate token count (approximate using word count)
    const wordCount = newPrompt.split(/\s+/).length;
    const tokenCount = Math.ceil(wordCount * 0.75); // Approximate tokens

    const [updatedPrompt] = await db
      .update(promptsTable)
      .set({ 
        prompt: newPrompt,
        tokenCount,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(promptsTable.id, promptId),
          eq(promptsTable.projectId, projectId)
        )
      )
      .returning();

    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update prompt" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = (await params).projectId;

    const json = await request.json();
    const parsedPrompt = newPromptSchema.safeParse(json);

    if (!parsedPrompt.success) {
      return NextResponse.json({ error: parsedPrompt.error }, { status: 400 });
    }

    const promptData = parsedPrompt.data;

    const [newPrompt] = await db
      .insert(promptsTable)
      .values({ ...promptData, projectId })
      .returning();

    return NextResponse.json(newPrompt);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create prompt" },
      { status: 500 }
    );
  }
}
