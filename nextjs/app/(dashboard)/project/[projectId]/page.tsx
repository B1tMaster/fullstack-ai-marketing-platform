import { notFound } from "next/navigation";
import React from "react";

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  if (projectId != "123") {
    return notFound();
  }

  return <div>ProjectPage: {projectId} </div>;
}
