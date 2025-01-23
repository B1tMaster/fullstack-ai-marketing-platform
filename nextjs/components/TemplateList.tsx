"use client";

import { Template, TemplatePrompt } from "@/server/db/schema";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Dot } from "lucide-react";
import { getTimeDifference } from "@/utils/timeUtils";

interface TemplateListProps {
  templates: Template[];
}

function TemplateList({ templates }: TemplateListProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [templateStatuses, setTemplateStatuses] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchPromptCount = async (templateId: string): Promise<number> => {
      try {
        const response = await axios.get<TemplatePrompt[]>(
          `/api/templates/${templateId}/prompts`
        );
        console.log("template count response", response.data);
        return response.data.length;
      } catch (error) {
        return 0;
      }
    };

    const fetchTemplateStatus = async () => {
      setIsLoading(true);
      const promptCountsForTemplates: Record<string, number> = {};

      for (const template of templates) {
        // Fetch the status of each template
        const promptCounts = await fetchPromptCount(template.id);
        promptCountsForTemplates[template.id] = promptCounts;
      }

      setTemplateStatuses(promptCountsForTemplates);
      setIsLoading(false);
    };

    fetchTemplateStatus();
  }, [templates]);

  return (
    <div className="grid gap-7 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      {templates.map((template) => (
        <Link href={`/template/${template.id}`} key={template.id}>
          <Card className="border border-gray-200 p-1 rounded-xl hover:border-main hover:scale-[1.01] hover:shadow-md hover:text-main transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1 w-full">
                <CardTitle className="text-xl lg:text-2xl truncate pr-4">
                  {template.title}
                </CardTitle>
                {isLoading ? (
                  <Skeleton className="h-6 w-[40%]" />
                ) : (
                  <div className="flex items-center truncate">
                    <p className="text-sm text-gray-500 truncate">
                      {templateStatuses[template.id] || 0} prompts
                    </p>
                    <Dot className="text-main flex-shrink-0" />
                    <p className="text-sm text-gray-500 truncate">
                      Updated {getTimeDifference(template.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default TemplateList;
