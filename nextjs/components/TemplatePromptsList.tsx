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

  const handlePromptClick = (prompt: Prompt) => {
    if (editingPrompt?.id === prompt.id) {
      setEditingPrompt(null);
      router.push(`/template/${templateId}?tab=prompts`, { scroll: false });
    } else {
      setEditingPrompt(prompt);
      router.push(`/template/${templateId}?tab=prompts&promptId=${prompt.id}`, { scroll: false });
    }
  };

  const handleEditorClose = () => {
    setEditingPrompt(null);
    router.push(`/template/${templateId}?tab=prompts`, { scroll: false });
  };


  const handleDeletePrompt = async () => {
    if (!promptToDelete || !templateId) {
      console.error('Missing promptToDelete or templateId:', { promptToDelete, templateId });
      return;
    }

    setIsDeleting(true);
    try {
      logger.debug('Deleting prompt', {
        component: 'TemplatePromptsList',
        action: 'handleDeletePrompt',
        templateId,
        promptToDelete
      });
      await axios.delete(`/api/templates/${templateId}/prompts?id=${promptToDelete}`);
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
            onUpdate={() => handlePromptClick(prompt)}
          />
        </div>
      ))}

      {editingPrompt && (
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
            logger.debug('Prompt update received', {
              component: 'TemplatePromptsList',
              action: 'onSave',
              updatedPrompt
            });
            setPrompts(prev => 
              prev.map(p => p.id === updatedPrompt.id ? updatedPrompt as Prompt : p)
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
