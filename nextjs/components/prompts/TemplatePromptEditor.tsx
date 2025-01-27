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
    onSave(updatedPrompt);
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
