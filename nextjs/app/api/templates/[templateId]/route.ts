import { db } from "@/server/db";
import { templatesTable } from "@/server/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { templateId: string } }
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templateId = await params.templateId;

  try {
    const { title } = await req.json();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
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
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTemplate[0]);
  } catch (error) {
    console.error("Error updating template", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { templateId: string } }
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templateId = await params.templateId;

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
        { status: 404 }
      );
    }

    return NextResponse.json(deletedTemplate[0]);
  } catch (error) {
    console.error("Error deleting template", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
