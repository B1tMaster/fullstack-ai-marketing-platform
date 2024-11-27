import React from "react";

type Template = {
  name: string;
};

export default async function TemplatesPage() {
  const templatePromise = new Promise<Template[]>((resolve) => {
    setTimeout(() => {
      resolve([
        { name: "Template 4" },
        { name: "Template 5" },
        { name: "Template 6" },
      ]);
    }, 5000);
  });

  const templates = await templatePromise;

  return (
    <div>
      <h1>Templates Page</h1>
      {templates.map((template, idx) => (
        <div key={idx}>{template.name}</div>
      ))}
    </div>
  );
}
