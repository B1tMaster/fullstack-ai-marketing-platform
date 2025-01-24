"use client";

import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, X, CheckIcon, SquarePen, Save } from "lucide-react";
import { Prompt } from "@/server/db/schema";
import { formatTokens, getPromptTokenCount } from "@/utils/tokenHelper";
import { MAX_TOKENS_PROMPT } from "@/lib/constants";
import ConfirmationModal from "./ConfirmationModal";
import toast from "react-hot-toast";

interface PromptEditorDialogProps {
  prompt: Prompt;
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPrompt: Prompt) => void;
}

function PromptEditorDialog({
  prompt,
  projectId,
  isOpen,
  onOpenChange,
  onSave,
}: PromptEditorDialogProps) {
  return (
    <ProjectPromptEditor
      projectId={projectId}
      prompt={prompt}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSave={onSave}
      onCancel={() => onOpenChange(false)}
    />
  );
}

export default PromptEditorDialog;
