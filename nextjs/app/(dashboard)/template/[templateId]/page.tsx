import { notFound } from "next/navigation";
import React from "react";

type TemplatePageProps = Promise<{
  templateId: string;
}>;

export default async function TemplatePage(props: {
  params: TemplatePageProps;
}) {
  const params = await props.params;

  if (params.templateId != "123") {
    return notFound();
  }

  return <div>TemplatePage: {params.templateId}</div>;
}
