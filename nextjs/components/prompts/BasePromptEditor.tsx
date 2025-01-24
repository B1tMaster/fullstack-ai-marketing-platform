"use client";

import React, { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, X, CheckIcon, SquarePen, Save } from "lucide-react";
import { formatTokens, getPromptTokenCount } from "@/utils/tokenHelper";
import { MAX_TOKENS_PROMPT } from "@/lib/constants";
import ConfirmationModal from "../ConfirmationModal";
import toast from "react-hot-toast";
import { CommonPrompt } from "@/interfaces/CommonPrompt";

/**
 * BasePromptEditor - Shared component for prompt editing UI
 * 
 * Props:
 * - prompt: CommonPrompt - The prompt data to edit
 * - isOpen: boolean - Whether the dialog is open
 * - onOpenChange: (open: boolean) => void - Callback for open state changes
 * - onSave: (updatedPrompt: CommonPrompt) => void - Callback when prompt is saved
 * - onCancel: () => void - Callback when editing is cancelled
 * - isSaving: boolean - Whether a save operation is in progress
 */
interface BasePromptEditorProps {
  prompt: CommonPrompt;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPrompt: CommonPrompt) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function BasePromptEditor({
  prompt,
  isOpen,
  onOpenChange,
  onSave,
  onCancel,
  isSaving,
}: BasePromptEditorProps) {
  const [editedName, setEditedName] = useState(prompt?.name || "");
  const [editedPrompt, setEditedPrompt] = useState(prompt?.prompt || "");
  const [tokenCount, setTokenCount] = useState(prompt?.tokenCount || 0);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  
  const hasChanges = editedPrompt !== (prompt?.prompt || "") || 
                    editedName !== (prompt?.name || "");
  const isTokenLimitExceeded = tokenCount > MAX_TOKENS_PROMPT;

  // Calculate tokens in real-time
  useEffect(() => {
    const calculateTokens = async () => {
      const newTokenCount = await getPromptTokenCount(editedPrompt);
      setTokenCount(newTokenCount);
    };

    calculateTokens();
  }, [editedPrompt]);

  const handleSave = () => {
    const updatedPrompt = {
      ...prompt,
      name: editedName,
      prompt: editedPrompt,
      tokenCount,
    };
    onSave(updatedPrompt);
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirmation(true);
    } else {
      onCancel();
    }
  };

  return (
    <>
      {/* Dialog implementation */}
      {/* ... existing dialog UI code ... */}
      
      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirmation}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to discard them?"
        isLoading={false}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={() => {
          setEditedPrompt(prompt?.prompt || "");
          onCancel();
        }}
      />
    </>
  );
}

export default BasePromptEditor;
