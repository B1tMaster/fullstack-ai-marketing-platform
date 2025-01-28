"use client";

import React from "react";
import BasePromptEditor from "./BasePromptEditor";
import { CommonPrompt } from "@/interfaces/CommonPrompt";
import axios from "axios";
import toast from "react-hot-toast";

interface ProjectPromptEditorProps {
  projectId: string;
  prompt: CommonPrompt;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPrompt: CommonPrompt) => void;
  onCancel: () => void;
}

function ProjectPromptEditor({
  projectId,
  prompt,
  isOpen,
  onOpenChange,
  onSave,
  onCancel,
}: ProjectPromptEditorProps) {
  const handleSave = async (updatedPrompt: CommonPrompt) => {
    try {
      const response = await axios.patch<CommonPrompt>(
        `/api/projects/${projectId}/prompts`,
        {
          promptId: updatedPrompt.id,
          name: updatedPrompt.name,
          prompt: updatedPrompt.prompt
        }
      );
      onSave(response.data);
      toast.success("Prompt saved successfully");
    } catch (error) {
      logger.error("Failed to save prompt", error, {
        component: 'ProjectPromptEditor',
        action: 'handleSave',
        projectId,
        promptId: updatedPrompt.id
      });
      toast.error("Failed to save prompt");
    }
  };

  return (
    <BasePromptEditor
      prompt={prompt}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSave={handleSave}
      onCancel={onCancel}
      isSaving={false}
    />
  );
}

export default ProjectPromptEditor;
