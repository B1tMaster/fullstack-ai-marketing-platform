"use client";

import React from "react";
import BasePromptEditor from "./BasePromptEditor";
import { CommonPrompt } from "@/interfaces/CommonPrompt";
import axios from "axios";
import toast from "react-hot-toast";
import logger from "@/utils/logger";

interface TemplatePromptEditorProps {
  templateId: string;
  prompt: CommonPrompt;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPrompt: CommonPrompt) => void;
  onCancel: () => void;
}

function TemplatePromptEditor({
  templateId,
  prompt,
  isOpen,
  onOpenChange,
  onSave,
  onCancel,
}: TemplatePromptEditorProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  logger.debug("Editor initialized", {
    component: "TemplatePromptEditor",
    action: "constructor",
    templateId,
  });
  const handleSave = async (updatedPrompt: CommonPrompt) => {
    try {
      setIsSaving(true);
      logger.debug("Saving prompt", {
        component: "TemplatePromptEditor",
        action: "handleSave",
        updatedPrompt,
        templateId,
      });

      const response = await axios.patch<CommonPrompt>(
        `/api/templates/${templateId}/prompts`,
        {
          id: updatedPrompt.id,
          name: updatedPrompt.name,
          prompt: updatedPrompt.prompt,
          order: updatedPrompt.order,
        }
      );

      logger.debug("Prompt saved successfully", {
        component: "TemplatePromptEditor",
        action: "handleSave",
        responseData: response.data,
      });
      if (response.data) {
        const completeUpdatedPrompt = {
          ...response.data,
          templateId,
        };
        onSave(completeUpdatedPrompt);
      }
      toast.success("Prompt saved successfully");
    } catch (error: unknown) {
      logger.error(
        "Failed to save prompt",
        error instanceof Error ? error : new Error(String(error)),
        {
          component: "TemplatePromptEditor",
          action: "handleSave",
          templateId,
          promptId: updatedPrompt.id,
        }
      );
      toast.error("Failed to save prompt");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BasePromptEditor
      prompt={prompt}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSave={handleSave}
      onCancel={onCancel}
      isSaving={isSaving}
    />
  );
}

export default TemplatePromptEditor;
