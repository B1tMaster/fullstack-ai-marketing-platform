"use client";

import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader2, X } from "lucide-react";
import { Prompt } from "@/server/db/schema";
import { formatTokens, getPromptTokenCount, initializeTokenEncoder } from "@/utils/tokenHelper";
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
  const [editedPrompt, setEditedPrompt] = useState(prompt?.prompt || "");
  const [tokenCount, setTokenCount] = useState(prompt?.tokenCount || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const hasChanges = editedPrompt !== (prompt?.prompt || "");
  const isTokenLimitExceeded = tokenCount > MAX_TOKENS_PROMPT;

  // Calculate tokens in real-time
  useEffect(() => {
    const calculateTokens = async () => {
      await initializeTokenEncoder();
      const newTokenCount = getPromptTokenCount(editedPrompt);
      setTokenCount(newTokenCount);
    };

    calculateTokens();
  }, [editedPrompt]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/prompts`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptId: prompt.id,
          prompt: editedPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save prompt");
      }

      const updatedPrompt = await response.json();
      onSave(updatedPrompt);
      toast.success("Prompt saved successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save prompt", error);
      toast.error("Failed to save prompt");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirmation(true);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl z-50">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Edit Prompt
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-gray-900"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            <Textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="min-h-[200px] w-full"
              placeholder="Enter your prompt..."
            />

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Tokens: {formatTokens(tokenCount)} / {formatTokens(MAX_TOKENS_PROMPT)}
                {isTokenLimitExceeded && (
                  <span className="ml-2 text-red-500">(Token limit exceeded)</span>
                )}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowSaveConfirmation(true)}
                  disabled={isSaving || isTokenLimitExceeded || !hasChanges}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSaveConfirmation}
        title="Save Changes"
        message="Are you sure you want to save these changes?"
        isLoading={isSaving}
        onClose={() => setShowSaveConfirmation(false)}
        onConfirm={handleSave}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirmation}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to discard them?"
        isLoading={false}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={() => {
          setEditedPrompt(prompt?.prompt || "");
          onOpenChange(false);
        }}
      />
    </>
  );
}

export default PromptEditorDialog;
