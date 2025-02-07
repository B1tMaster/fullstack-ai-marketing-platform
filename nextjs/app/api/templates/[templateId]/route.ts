import { db } from "@/server/db";
import { templatesTable } from "@/server/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import logger from "@/utils/logger";
import { HttpStatus } from "@/constants/http";

type Params = Promise<{ templateId: string }>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatus.UNAUTHORIZED }
    );
  }

  const templateId = (await params).templateId;

  try {
    const { title } = await request.json();
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const updatedTemplate = await db
      .update(templatesTable)
      .set({ title })
      .where(
        and(
          eq(templatesTable.id, templateId),
          eq(templatesTable.userId, userId)
        )
      )
      .returning();

    if (updatedTemplate.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    return NextResponse.json(updatedTemplate[0]);
  } catch (error) {
    logger.error(
      "Error updating template",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "templateRoute",
        action: "PATCH",
        templateId,
      }
    );
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatus.UNAUTHORIZED }
    );
  }

  const templateId = (await params).templateId;

  try {
    const deletedTemplate = await db
      .delete(templatesTable)
      .where(
        and(
          eq(templatesTable.id, templateId),
          eq(templatesTable.userId, userId)
        )
      )
      .returning();

    if (deletedTemplate.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    return NextResponse.json(deletedTemplate[0]);
  } catch (error) {
    logger.error(
      "Error deleting template",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "templateRoute",
        action: "DELETE",
        templateId,
      }
    );
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
