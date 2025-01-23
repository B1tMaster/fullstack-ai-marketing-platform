"use client";

import React, { useState } from "react";
import PromptEditorDialog from "./PromptEditorDialog";
import { Prompt } from "@/server/db/schema";
import PromptContainerCard from "./PromptContainerCard";
import ConfirmationModal from "./ConfirmationModal";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface PromptsListProps {
  prompts: Prompt[];
  projectId: string;
  onPromptDeleted: (deletedPromptId: string) => void;
}

function PromptsList({ prompts, projectId, onPromptDeleted }: PromptsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);
  const [promptToDelete, setPromptToDelete] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handlePromptClick = (promptId: string) => {
    router.push(`?tab=prompts&promptId=${promptId}`, { scroll: false });
  };

  const handlePromptDoubleClick = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsEditorOpen(true);
  };

  const handlePromptUpdate = async (promptId: string, newPrompt: string) => {
    try {
      const response = await axios.patch<Prompt>(
        `/api/projects/${projectId}/prompts`,
        {
          promptId,
          prompt: newPrompt
        }
      );
      const updatedPrompt = response.data;
      setPrompts(prev => 
        prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p)
      );
      toast.success("Prompt updated successfully");
    } catch (error) {
      console.error("Failed to update prompt", error);
      toast.error("Failed to update prompt");
    }
  };

  const handleDeletePrompt = async () => {
    if (!promptToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/projects/${projectId}/prompts`, {
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
        <PromptContainerCard
          key={prompt.id}
          prompt={prompt}
          isActive={searchParams.get("promptId") === prompt.id}
          onClick={() => handlePromptClick(prompt.id)}
          onDoubleClick={() => handlePromptDoubleClick(prompt)}
          onDelete={() => {
            setPromptToDelete(prompt.id);
            setShowDeleteConfirmation(true);
          }}
          onUpdate={(newPrompt) => handlePromptUpdate(prompt.id, newPrompt)}
        />
      ))}

      <PromptEditorDialog
        prompt={editingPrompt!}
        projectId={projectId}
        isOpen={isEditorOpen}
        onOpenChange={(open) => {
          setIsEditorOpen(open);
          if (!open) {
            setEditingPrompt(null);
          }
        }}
        onSave={(updatedPrompt) => {
          setPrompts(prev => 
            prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p)
          );
          setEditingPrompt(null);
        }}
      />

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

export default PromptsList;
