"use client";

import React from "react";
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

  const handlePromptClick = (promptId: string) => {
    router.push(`?tab=prompts&promptId=${promptId}`, { scroll: false });
  };

  const handleDeletePrompt = async () => {
    if (!promptToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/projects/${projectId}/prompts/${promptToDelete}`);
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
          onDelete={() => {
            setPromptToDelete(prompt.id);
            setShowDeleteConfirmation(true);
          }}
        />
      ))}

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
