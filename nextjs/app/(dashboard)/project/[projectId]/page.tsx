import { notFound } from "next/navigation";
import React from "react";

type ProjectPageProps = Promise<{
  projectId: string;
}>;

export default async function ProjectPage(props: { params: ProjectPageProps }) {
  const params = await props.params;

  if (params.projectId != "123") {
    return notFound();
  }

  return <div>ProjectPage: {params.projectId}</div>;
}
