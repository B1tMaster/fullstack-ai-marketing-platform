import React from "react";
import { Skeleton } from "./ui/skeleton";
import { GeneratedContent } from "@/server/db/schema";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Copy, Edit } from "lucide-react";

interface GenerateStepBodyProps {
  isLoading: boolean;
  isGenerating: boolean;
  generatedCount: number;
  totalPrompts: number;
  errorMessage: string | null;
  generatedContent: GeneratedContent[];
}

function GenerateStepBody({
  isLoading,
  isGenerating,
  generatedCount,
  totalPrompts,
  errorMessage,
  generatedContent,
}: GenerateStepBodyProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <Skeleton className="h-32 sm:h-36 md:h-40 lg:h-[200px] w-full rounded-lg" />
        <Skeleton className="h-32 sm:h-36 md:h-40 lg:h-[200px] w-full rounded-lg" />
      </div>
    );
  }

  if (isGenerating) {
    const progress = (generatedCount / totalPrompts) * 100;
    return (
      <div className="space-y-3 animate-pulse max-w-full lg:max-w-4xl mx-auto px-4 lg:px-0">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center text-main">
          <h3 className="font-bold text-lg lg:text-xl mb-2 lg:mb-0">
            Generating Content...
          </h3>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-main h-2.5 rounded-full animate-pulse"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Generated {generatedCount} of {totalPrompts} prompts
        </div>
      </div>
    );
  }

  if (generatedCount === 0 && errorMessage === null) {
    return (
      <div className="space-y-3 flex-1 flex flex-col items-center justify-center px-4 lg:px-0">
        <div className="font-semibold text-base lg:text-lg text-center">
          No content available yet. Click the button above to generate.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="flex justify-center">
          <div className="w-full lg:w-1/2 text-center rounded-xl p-3 lg:p-4 bg-red-50 text-red-500 text-sm lg:text-base">
            {errorMessage}
          </div>
        </div>
      )}

      {/* GENERATED CONTENT */}
      <div>
        {generatedContent.map((content) => (
          <Card
            key={content.id}
            className="border border-gray-200 rounded-xl lg:rounded-2xl shadow-sm hover:border-main hover:shadow-md hover:scale-[1.01] transition-all duration-300"
          >
            <CardContent>
              <div className="flex flex-row items-center justify-between">
                <h3 className="font-bold text-lg lg:text-xl text-main truncate lg:mb-0">
                  {content.name}
                </h3>
                <div className="space-x-2 flex-shrink-0 lg:ml-2">
                  <Button
                    // onClick={() => handleEdit(item.id, item.result)}
                    className="bg-main/10 text-main hover:bg-main/20 rounded-full w-8 h-8 p-0"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    // onClick={() => copyToClipboard(item.result)}
                    className="bg-main/10 text-main hover:bg-main/20 rounded-full w-8 h-8 p-0"
                    title="Copy to Clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {/* TODO: If editing, turn into text area with action buttons at bottom */}
              <div className="whitespace-pre-wrap text-gray-700 lg:px-2 text-sm lg:text-base">
                {content.result}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default GenerateStepBody;
