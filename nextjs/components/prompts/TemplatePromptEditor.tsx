"use client";

import React from "react";
import BasePromptEditor from "./BasePromptEditor";
import { CommonPrompt } from "@/interfaces/CommonPrompt";
import axios from "axios";
import toast from "react-hot-toast";

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
  console.log('TemplatePromptEditor - constructor with templateId:', templateId);
  const handleSave = async (updatedPrompt: CommonPrompt) => {
    try {
      const endpoint = `/api/templates/${templateId}/prompts`;
      console.log('TemplatePromptEditor - Endpoint:', endpoint);
      console.log('TemplatePromptEditor - templateId:', templateId);
      console.log('TemplatePromptEditor - updatedPrompt:', updatedPrompt);
      const response = await axios.patch<CommonPrompt>(
        endpoint,
        updatedPrompt
      );
      onSave(response.data);
      toast.success("Prompt saved successfully");
    } catch (error) {
      console.error("Failed to save prompt:", error);
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

export default TemplatePromptEditor;
