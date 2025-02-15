import SubscriptionMessage from "@/components/SubscriptionMessage";
import TemplateDetailView from "@/components/TemplateDetailView";
import { getTemplate, getUserSubscription } from "@/server/queries";
import { notFound } from "next/navigation";
import React from "react";

type Params = Promise<{ templateId: string }>;

export default async function TemplatePage(props: { params: Params }) {
  const templateId = (await props.params).templateId;
  const template = await getTemplate(templateId);
  const subscription = await getUserSubscription();
  const isSubscribed =
    subscription && subscription.status === "active" ? true : false;

  if (!template) {
    return notFound();
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 mt-2">
      {!isSubscribed && <SubscriptionMessage />}
      <TemplateDetailView template={template} />
    </div>
  );
}
