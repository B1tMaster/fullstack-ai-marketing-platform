"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";
import { getTemplatesForUser } from "@/server/queries";
import { Template } from "@/server/db/schema";
import { useToast } from "./ui/use-toast";
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
  const { toast } = useToast();

  // Fetch templates when dialog opens
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      try {
        const userTemplates = await getTemplatesForUser();
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
        toast({
          title: "Error",
          description: "Failed to load templates",
          variant: "destructive",
        });
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
      const response = await fetch(
        `/api/templates/${selectedTemplateId}/prompts`
      );
      if (!response.ok) throw new Error("Failed to fetch template prompts");

      const templatePrompts = await response.json();

      // Inject prompts into project
      const injectResponse = await fetch(
        `/api/projects/${projectId}/prompts/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompts: templatePrompts.map((prompt) => ({
              name: prompt.name,
              prompt: prompt.prompt,
              order: prompt.order,
              tokenCount: prompt.tokenCount,
            })),
          }),
        }
      );

      if (!injectResponse.ok) throw new Error("Failed to inject prompts");

      const result = await injectResponse.json();
      onTemplateInjected(result.insertedCount);
      toast({
        title: "Success",
        description: `Injected ${result.insertedCount} prompts from template`,
      });
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
      toast({
        title: "Error",
        description: "Failed to inject template prompts",
        variant: "destructive",
      });
    } finally {
      setIsInjecting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Load Template Prompts</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isInjecting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowConfirmation(true)}
              disabled={!selectedTemplateId || isInjecting}
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
