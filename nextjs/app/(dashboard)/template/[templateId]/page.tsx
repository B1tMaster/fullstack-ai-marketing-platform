import TemplateDetailView from "@/components/TemplateDetailView";
import { getTemplate } from "@/server/queries";
import { notFound } from "next/navigation";
import React from "react";

type Params = Promise<{ templateId: string }>;

export default async function TemplatePage(props: { params: Params }) {
  const templateId = (await props.params).templateId;
  const template = await getTemplate(templateId);

  if (!template) {
    return notFound();
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 mt-2">
      <TemplateDetailView template={template} />
    </div>
  );
}
