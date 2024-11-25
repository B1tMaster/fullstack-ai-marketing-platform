"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { projectsTable } from "./db/schema";

export async function createProject() {
  //  Figure out who the user is
  const { userId } = await auth();

  // Verify the user exists
  if (!userId) {
    throw new Error("mutation: User not found");
  }

  // Create project in database
  await db
    .insert(projectsTable)
    .values({
      title: "New Project",
      userId,
    })
    .returning();

  // TODO: LATER - redirect to detail view
  // redirect -> `/project/${newProject.id}`;
}
