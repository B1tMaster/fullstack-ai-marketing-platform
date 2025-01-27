"use client";

import React, { useState } from "react";
import TemplatePromptEditor from "./prompts/TemplatePromptEditor";
import { Prompt } from "@/server/db/schema";
import PromptContainerCard from "./PromptContainerCard";
import ConfirmationModal from "./ConfirmationModal";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface TemplatePromptsListProps {
  prompts: Prompt[];
  templateId: string;
  onPromptDeleted: (deletedPromptId: string) => void;
  setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>;
}

function TemplatePromptsList({ prompts, templateId, onPromptDeleted, setPrompts }: TemplatePromptsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);
  const [promptToDelete, setPromptToDelete] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const isEditorOpen = !!editingPrompt;

  console.log('TemplatePromptsList - received templateId:', templateId);
  
  const handlePromptClick = (prompt: Prompt) => {
    console.log('TemplatePromptsList - handlePromptClick with templateId:', templateId);
    if (editingPrompt?.id === prompt.id) {
      // If clicking the same prompt, close the editor
      setEditingPrompt(null);
      router.push(`?tab=prompts`, { scroll: false });
    } else {
      // Open editor for new prompt
      setEditingPrompt(prompt);
      router.push(`?tab=prompts&promptId=${prompt.id}`, { scroll: false });
    }
  };

  const handleEditorClose = () => {
    setEditingPrompt(null);
    router.push(`?tab=prompts`, { scroll: false });
  };

  const handlePromptUpdate = (promptId: string, newPrompt: string, currentPrompt: Prompt) => {
    const updatedPrompt = {
      ...currentPrompt,
      prompt: newPrompt
    };
    setPrompts(prev => 
      prev.map(p => p.id === promptId ? updatedPrompt : p)
    );
  };

  const handleDeletePrompt = async () => {
    if (!promptToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/templates/${templateId}/prompts`, {
        data: { promptId: promptToDelete }
      });
      onPromptDeleted(promptToDelete);
      toast.success("Prompt deleted successfully");
    } catch (error) {
      console.error("Failed to delete prompt", error);
      toast.error("Failed to delete prompt");
    } finally {
      setIsDeleting(false);
      setPromptToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <div className="space-y-4 mt-6">
      {prompts.map((prompt) => (
        <div key={prompt.id}>
          <PromptContainerCard
            key={prompt.id}
            prompt={prompt}
            isActive={searchParams.get("promptId") === prompt.id}
            onClick={() => handlePromptClick(prompt)}
            onDelete={() => {
              setPromptToDelete(prompt.id);
              setShowDeleteConfirmation(true);
            }}
            onUpdate={(newPrompt) => {
              const currentPrompt = prompt; // Use the prompt from the map iteration
              handlePromptUpdate(currentPrompt.id, newPrompt, currentPrompt);
            }}
          />
        </div>
      ))}

      {editingPrompt && (
        console.log('TemplatePromptsList - rendering TemplatePromptEditor with templateId:', templateId),
        <TemplatePromptEditor
          templateId={templateId}
          prompt={editingPrompt}
          isOpen={isEditorOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleEditorClose();
            }
          }}
          onSave={(updatedPrompt) => {
            setPrompts(prev => 
              prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p)
            );
            handleEditorClose();
          }}
          onCancel={handleEditorClose}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete Prompt"
        message="Are you sure you want to delete this prompt? This action cannot be undone."
        isLoading={isDeleting}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeletePrompt}
      />
    </div>
  );
}

export default TemplatePromptsList;
