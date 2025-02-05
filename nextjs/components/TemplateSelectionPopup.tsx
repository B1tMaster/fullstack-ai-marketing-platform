"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { Template } from "@/server/db/schema";
import toast from "react-hot-toast";
import logger from "@/utils/logger";
import ConfirmationModal from "./ConfirmationModal";

interface TemplateSelectionPopupProps {
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateInjected: (injectedPrompts: number) => void;
}

export default function TemplateSelectionPopup({
  projectId,
  isOpen,
  onOpenChange,
  onTemplateInjected,
}: TemplateSelectionPopupProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch templates when dialog opens
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      try {
        logger.debug("Fetching templates", {
          component: "TemplateSelectionPopup",
          action: "fetchTemplates"
        });
        
        const response = await axios.get<Template[]>("/api/templates");
        const userTemplates = response.data;
        
        logger.debug("Templates response received", {
          component: "TemplateSelectionPopup",
          action: "fetchTemplates",
          templatesCount: userTemplates?.length || 0,
          templates: userTemplates
        });

        if (!userTemplates?.length) {
          logger.warn("No templates found", {
            component: "TemplateSelectionPopup",
            action: "fetchTemplates"
          });
          toast.error("No templates found");
          return;
        }
        setTemplates(userTemplates);
      } catch (error) {
        logger.error(
          "Failed to fetch templates",
          error instanceof Error ? error : new Error(String(error)),
          {
            component: "TemplateSelectionPopup",
            action: "fetchTemplates",
          }
        );
        toast.error("Failed to load templates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [isOpen, toast]);

  const handleTemplateSelect = (value: string) => {
    setSelectedTemplateId(value);
  };

  const handleInjectTemplate = async () => {
    if (!selectedTemplateId) return;

    setIsInjecting(true);
    try {
      // Fetch template prompts
      const promptsResponse = await axios.get(`/api/templates/${selectedTemplateId}/prompts`);
      const templatePrompts = promptsResponse.data;

      // Inject prompts into project
      const injectResponse = await axios.post(`/api/projects/${projectId}/prompts/bulk`, {
        prompts: templatePrompts.map((prompt) => ({
          name: prompt.name,
          prompt: prompt.prompt,
          order: prompt.order,
          tokenCount: prompt.tokenCount,
        })),
      });

      const result = injectResponse.data;
      if (result.insertedCount > 0) {
        onTemplateInjected(result.insertedCount);
      } else {
        throw new Error("No prompts were injected");
      }
      onOpenChange(false);
    } catch (error) {
      logger.error(
        "Failed to inject template",
        error instanceof Error ? error : new Error(String(error)),
        {
          component: "TemplateSelectionPopup",
          action: "handleInjectTemplate",
          projectId,
          templateId: selectedTemplateId,
        }
      );
      toast.error("Failed to inject template prompts");
    } finally {
      setIsInjecting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[525px] p-6 bg-white rounded-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Load Template Prompts
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger className="w-full h-12 px-4 border border-gray-200 bg-gray-50 hover:border-main focus:border-main focus:ring-2 focus:ring-main/20 rounded-xl">
                  <SelectValue placeholder="Select a template" className="text-[1.2em]" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-xl max-h-[300px]">
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isInjecting}
              className="mt-3 sm:mt-0 w-full sm:w-auto border-main text-main hover:bg-main/5"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowConfirmation(true)}
              disabled={!selectedTemplateId || isInjecting}
              className="w-full sm:w-auto bg-main hover:bg-main/90"
            >
              {isInjecting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Load Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={showConfirmation}
        title="Load Template Prompts"
        message="Are you sure you want to load prompts from this template? This will add them to your project."
        isLoading={isInjecting}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleInjectTemplate}
      />
    </>
  );
}
