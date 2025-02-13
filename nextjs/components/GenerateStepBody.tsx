"use client";
import React, { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { GeneratedContent } from "@/server/db/schema";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Copy, Edit, Save, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import logger from "@/utils/logger";

interface GenerateStepBodyProps {
  projectId: string;
  isLoading: boolean;
  isGenerating: boolean;
  generatedCount: number;
  totalPrompts: number;
  errorMessage: string | null;
  generatedContent: GeneratedContent[];
  setGeneratedContent: React.Dispatch<React.SetStateAction<GeneratedContent[]>>;
}

function GenerateStepBody({
  projectId,
  isLoading,
  isGenerating,
  generatedCount,
  totalPrompts,
  errorMessage,
  generatedContent,
  setGeneratedContent,
}: GenerateStepBodyProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditedContent(content);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedContent("");
  };

  const handleSave = async (id: string) => {
    try {
      setIsSaving(true);
      await axios.patch(`/api/projects/${projectId}/generated-content`, {
        id,
        result: editedContent,
      });
      
      // Update the content in the UI
      setGeneratedContent((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, result: editedContent } : item
        )
      );
      
      setEditingId(null);
      setEditedContent("");
      toast.success("Content saved successfully");
    } catch (error) {
      toast.error("Failed to save content");
      logger.error("Error while saving edited content", error instanceof Error ? error : new Error(String(error)), {
        id,
        component: "GenerateStepBody",
        status: error instanceof Error ? 'error' : 'success'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
      logger.error("Failed to copy to clipboard", error instanceof Error ? error : new Error(String(error)), {
        component: "GenerateStepBody"
      });
    }
  };

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
      <div className="space-y-6">
        {generatedContent.map((content) => (
          <Card
            key={content.id}
            className="border border-gray-200 rounded-xl lg:rounded-2xl shadow-sm hover:border-main hover:shadow-md hover:scale-[1.01] transition-all duration-300"
          >
            <CardContent className="p-4 lg:p-8 space-y-1 flex-grow min-w-0">
              <div className="flex flex-row items-center justify-between">
                <h3 className="font-bold text-lg lg:text-xl text-main truncate lg:mb-0">
                  {content.name}
                </h3>
                <div className="space-x-2 flex-shrink-0 lg:ml-2">
                  <Button
                    onClick={() => handleEdit(content.id, content.result)}
                    className="bg-main/10 text-main hover:bg-main/20 rounded-full w-8 h-8 p-0"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => copyToClipboard(content.result)}
                    className="bg-main/10 text-main hover:bg-main/20 rounded-full w-8 h-8 p-0"
                    title="Copy to Clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {editingId === content.id ? (
                <div className="space-y-4">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full min-h-[200px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-main/20 text-sm lg:text-base"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={handleCancel}
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSave(content.id)}
                      className="bg-main text-white hover:bg-main/90"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-gray-700 lg:px-2 text-sm lg:text-base">
                  {content.result}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default GenerateStepBody;
