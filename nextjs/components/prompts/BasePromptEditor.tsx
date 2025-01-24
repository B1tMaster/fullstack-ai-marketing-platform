"use client";

import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
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

          {isEditingName ? (
            <div className="flex items-center gap-2 mb-4">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-xl font-bold text-gray-900"
              />
              <Button
                onClick={() => setIsEditingName(false)}
                className="h-8 w-8 rounded-full p-0 bg-red-100 text-red-500 hover:bg-red-200"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setIsEditingName(false)}
                className="h-8 w-8 rounded-full p-0 bg-green-100 text-green-600 hover:bg-green-200"
              >
                <CheckIcon className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="group relative mb-4">
              <h1 
                className="text-xl font-bold text-main cursor-pointer hover:underline hover:decoration-main hover:decoration-2 hover:underline-offset-4 animate-underline"
                onClick={() => setIsEditingName(true)}
              >
                {editedName}
              </h1>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full p-0 bg-gray-100/50 text-gray-500 hover:bg-gray-200/50 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingName(true);
                  }}
                >
                  <SquarePen className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full p-0 bg-gray-100/50 text-gray-500 hover:bg-gray-200/50 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCancelConfirmation(true);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
          
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
            <div className="space-x-2 flex items-center">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isTokenLimitExceeded || !hasChanges}
                className="text-base"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default BasePromptEditor;
