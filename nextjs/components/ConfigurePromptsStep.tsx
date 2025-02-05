"use client";

import React, { useEffect, useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import ConfigurePromptsStepHeader from "./ConfigurePromptsStepHeader";
import PromptsList from "./PromptsList";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Prompt } from "@/server/db/schema";
import { freeTokenEncoder } from "@/utils/tokenHelper";
import toast from "react-hot-toast";
import ProjectPromptEditor from "./prompts/ProjectPromptEditor";
import TemplateSelectionPopup from "./TemplateSelectionPopup";

interface ConfigurePromptsStepProps {
  projectId: string;
}

function ConfigurePromptsStep({ projectId }: ConfigurePromptsStepProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [isImportingTemplate, setIsImportingTemplate] = useState(false);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const router = useRouter();

  const handlePromptCreate = async () => {
    setIsCreatingPrompt(true);

    try {
      const response = await axios.post<Prompt>(
        `/api/projects/${projectId}/prompts`,
        {
          name: "New Prompt",
          prompt: "",
          order: prompts.length,
          tokenCount: 0,
        }
      );

      const newPrompt = response.data;
      setPrompts((prev) => [...prev, newPrompt]);

      router.push(`?tab=prompts&promptId=${newPrompt.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create prompt");
    } finally {
      setIsCreatingPrompt(false);
    }
  };

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await axios.get<Prompt[]>(
          `/api/projects/${projectId}/prompts`
        );
        setPrompts(response.data);
      } catch (error) {
        console.error("Failed to fetch prompts", error);
        toast.error("Failed to load prompts");
      } finally {
        setIsLoadingPrompts(false);
      }
    };

    fetchPrompts();
  }, [projectId]);

  useEffect(() => {
    return () => {
      freeTokenEncoder();
    };
  }, []);

  const handlePromptDeleted = (deletedPromptId: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== deletedPromptId));
  };

  return (
    <div>
      <ConfigurePromptsStepHeader
        isCreatingPrompt={isCreatingPrompt}
        handlePromptCreate={handlePromptCreate}
        isImportingTemplate={isImportingTemplate}
        onTemplateLoad={() => setShowTemplatePopup(true)}
      />

      <TemplateSelectionPopup
        projectId={projectId}
        isOpen={showTemplatePopup}
        onOpenChange={setShowTemplatePopup}
        onTemplateInjected={(injectedCount) => {
          // Refresh prompts list
          fetchPrompts();
          toast.success(`Successfully injected ${injectedCount} prompts`);
        }}
      />

      <ProjectPromptEditor
        projectId={projectId}
        prompt={{
          id: "",
          name: "",
          prompt: "",
          projectId,
          tokenCount: 0,
          order: 0,
        }}
        isOpen={false}
        onOpenChange={() => {}}
        onSave={() => {}}
        onCancel={() => {}}
      />

      {isLoadingPrompts ? (
        <div className="space-y-4 mt-6">
          <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      ) : (
        <PromptsList
          prompts={prompts}
          projectId={projectId}
          onPromptDeleted={handlePromptDeleted}
          setPrompts={setPrompts}
        />
      )}
    </div>
  );
}

export default ConfigurePromptsStep;
