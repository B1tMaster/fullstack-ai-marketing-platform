import ProjectDetailView from "@/components/project-detail/ProjectDetailView";
import SubscriptionMessage from "@/components/SubscriptionMessage";
import { getProject, getUserSubscription } from "@/server/queries";
import { notFound } from "next/navigation";
import React from "react";

type Params = Promise<{ projectId: string }>;

export default async function ProjectPage(props: { params: Params }) {
  //export default async function ProjectPage({ params }: ProjectPageProps) {
  const projectId = (await props.params).projectId;

  const project = await getProject(projectId);
  const subscription = await getUserSubscription();
  const isSubscribed =
    subscription && subscription.status === "active" ? true : false;

  if (!project) {
    return notFound();
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 mt-2">
      {!isSubscribed && <SubscriptionMessage />}
      <ProjectDetailView project={project} />
    </div>
  );
}
