"use client";

import { Template } from "@/server/db/schema";
import React, { useEffect, useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import TemplateDetailHeader from "./TemplateDetailHeader";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import TemplateDetailBody from "./TemplateDetailBody";
import { CommonPrompt } from "@/interfaces/CommonPrompt";
import TemplatePromptEditor from "./prompts/TemplatePromptEditor";
import logger from "@/utils/logger";

interface TemplateDetailViewProps {
  template: Template;
}

function TemplateDetailView({ template }: TemplateDetailViewProps) {
  const [prompts, setPrompts] = useState<CommonPrompt[]>([]);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<CommonPrompt | null>(null);
  const [isCreatingPrompt, setIscCreatingPrompt] = useState(false);
  const [showTemplateDeleteConfirmation, setShowTemplateDeleteConfirmation] = 
    useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await axios.get(
          `/api/templates/${template.id}/prompts`
        );
        setPrompts(response.data);

        logger.debug('Prompts fetched', {
          component: 'TemplateDetailView',
          action: 'fetchPrompts',
          prompts: response.data
        });
      } catch (error: unknown) {
        logger.error("Failed to fetch prompts", error instanceof Error ? error : new Error(String(error)), {
          component: 'TemplateDetailView',
          action: 'fetchPrompts',
          templateId: template.id
        });
        toast.error("Failed to load prompts. Please try again.");
      }
    };

    fetchPrompts();
  }, [template.id]);

  const handleDeleteTemplate = async () => {
    setIsDeletingTemplate(true);
    try {
      await axios.delete(`/api/templates/${template.id}`);
      toast.success("Template deleted successfully.");
      router.push("/templates?deleted=true");
    } catch (error: unknown) {
      logger.error("Failed to delete template", error instanceof Error ? error : new Error(String(error)), {
        component: 'TemplateDetailView',
        action: 'handleDeleteTemplate',
        templateId: template.id
      });
      toast.error("Error deleting template. Please try again later");
    } finally {
      setIsDeletingTemplate(false);
      setShowTemplateDeleteConfirmation(false);
    }
  };

  const handleCreatePrompt = async () => {
    setIscCreatingPrompt(true);
    try {
      const response = await axios.post(
        `/api/templates/${template.id}/prompts`,
        {
          name: "New Template Prompt",
          prompt: "",
          order: prompts.length,
          tokenCount: 0,
        }
      );

      const newPrompt = await response.data;
      setPrompts((prev) => [...prev, newPrompt]);
      router.push(`?promptId=${newPrompt.id}`);
    } catch (error: unknown) {
      logger.error("Failed to create template prompt", error instanceof Error ? error : new Error(String(error)), {
        component: 'TemplateDetailView',
        action: 'handleCreatePrompt',
        templateId: template.id
      });
      toast.error("Error creating template prompt. Please try again later.");
    } finally {
      setIscCreatingPrompt(false);
    }
  };



  const handleCloseDialog = () => {
    setSelectedPrompt(null);
    router.push(`/template/${template.id}`, { scroll: false });
  };

  return (
    <div className="space-y-4 md:space-x-6">
      <TemplateDetailHeader
        template={template}
        setShowTemplateDeleteConfirmation={setShowTemplateDeleteConfirmation}
      />
      <ConfirmationModal
        isOpen={showTemplateDeleteConfirmation}
        onClose={() => setShowTemplateDeleteConfirmation(false)}
        onConfirm={handleDeleteTemplate}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        isLoading={isDeletingTemplate}
      />
      <TemplateDetailBody
        handleCreatePrompt={handleCreatePrompt}
        isCreatingPrompt={isCreatingPrompt}
        prompts={prompts}
        templateId={template.id}
        setPrompts={setPrompts}
      />
      <TemplatePromptEditor
        templateId={template.id}
        prompt={selectedPrompt!}
        isOpen={!!selectedPrompt}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
        onSave={(updatedPrompt) => {
          setPrompts(prev => 
            prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p)
          );
          handleCloseDialog();
        }}
        onCancel={handleCloseDialog}
      />
    </div>
  );
}

export default TemplateDetailView;
