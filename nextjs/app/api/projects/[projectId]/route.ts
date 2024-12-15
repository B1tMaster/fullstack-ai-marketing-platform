import { db } from "@/server/db";
import { projectsTable } from "@/server/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { HttpStatus } from "@/constants/http";

const updateProjectSchema = z.object({
  title: z.string().min(1),
});

type Params = Promise<{ projectId: string }>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  const projectId = (await params).projectId;

  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatus.UNAUTHORIZED }
    );
  }

  const body = await request.json();
  const validatedData = updateProjectSchema.safeParse(body);

  if (!validatedData.success) {
    return NextResponse.json(
      { error: validatedData.error.errors },
      { status: HttpStatus.BAD_REQUEST }
    );
  }

  const { title } = validatedData.data;

  const updatedProject = await db
    .update(projectsTable)
    .set({ title })
    .where(
      and(eq(projectsTable.userId, userId), eq(projectsTable.id, projectId))
    )
    .returning();

  if (updatedProject.length === 0) {
    return NextResponse.json(
      { error: "Project not found" },
      { status: HttpStatus.NOT_FOUND }
    );
  }

  return NextResponse.json(updatedProject[0]);
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

  const projectId = (await params).projectId;

  const deletedProject = await db
    .delete(projectsTable)
    .where(
      and(eq(projectsTable.userId, userId), eq(projectsTable.id, projectId))
    )
    .returning();

  if (deletedProject.length === 0) {
    return NextResponse.json(
      { error: "Project not found" },
      { status: HttpStatus.NOT_FOUND }
    );
  }

  return NextResponse.json(deletedProject[0]);
}
