"use client";

import React, { useEffect, useState } from "react";
import GenerateStepHeader from "./GenerateStepHeader";
import axios from "axios";
import logger from "@/utils/logger";
import { Asset, GeneratedContent, Prompt } from "@/server/db/schema";
import { MAX_TOKENS_ASSETS, MAX_TOKENS_PROMPT } from "@/lib/constants";
import toast from "react-hot-toast";
import GenerateStepBody from "./GenerateStepBody";

interface GenerateContentStepProps {
  projectId: string;
}

function GenerateContentStep({ projectId }: GenerateContentStepProps) {
  const [canGenerate, setCanGenerate] = useState(false);
  const [projectHasContent, setProjectHasContent] = useState(false);
  const [projectHasPrompts, setProjectHasPrompts] = useState(false);
  const [isAssetsTokenExceeded, setIsAssetsTokenExceeded] = useState(false);
  const [isPromptsTokenExceeded, setIsPromptsTokenExceeded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>(
    []
  );
  const [generatedCount, setGeneratedCount] = useState(0);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const canGenerate =
      projectHasContent &&
      projectHasPrompts &&
      !isAssetsTokenExceeded &&
      !isPromptsTokenExceeded &&
      !isLoading &&
      !isGenerating;

    setCanGenerate(canGenerate);
  }, [
    isAssetsTokenExceeded,
    isGenerating,
    isLoading,
    isPromptsTokenExceeded,
    projectHasContent,
    projectHasPrompts,
  ]);

  useEffect(() => {
    const fetchAllProjectData = async () => {
      setIsLoading(true);

      try {
        const [generatedContentResponse, assetsResponse, promptsResponse] =
          await Promise.all([
            axios.get<GeneratedContent[]>(
              `/api/projects/${projectId}/generated-content`
            ),
            axios.get<Asset[]>(`/api/projects/${projectId}/assets`),
            axios.get<Prompt[]>(`/api/projects/${projectId}/prompts`),
          ]);

        setGeneratedContent(generatedContentResponse.data);
        setGeneratedCount(generatedContentResponse.data.length);

        setProjectHasContent(
          assetsResponse.data.some(
            (asset) => asset.content && asset.content.trim().length > 0
          )
        );

        setProjectHasPrompts(promptsResponse.data.length > 0);
        setTotalPrompts(promptsResponse.data.length);

        // Check to make sure we don't exceed asset token limits
        let totalTokenCount = 0;
        for (const asset of assetsResponse.data) {
          totalTokenCount += asset.tokenCount ?? 0;
        }
        setIsAssetsTokenExceeded(totalTokenCount > MAX_TOKENS_ASSETS);
        logger.debug('Asset token count check', {
          totalTokenCount,
          maxTokens: MAX_TOKENS_ASSETS,
          isExceeded: totalTokenCount > MAX_TOKENS_ASSETS
        });

        // Check to make sure we don't exceed prompt token limits
        let promptExceeded = false;
        for (const prompt of promptsResponse.data) {
          const promptTokens = prompt?.tokenCount ?? 0;
          logger.debug('Checking prompt token count', {
            promptId: prompt.id,
            promptTokens,
            maxTokens: MAX_TOKENS_PROMPT
          });
          
          if (promptTokens > MAX_TOKENS_PROMPT) {
            promptExceeded = true;
            logger.info('Prompt exceeds token limit', {
              promptId: prompt.id,
              promptTokens,
              maxTokens: MAX_TOKENS_PROMPT
            });
            break;
          }
        }
        setIsPromptsTokenExceeded(promptExceeded);
      } catch (error) {
        logger.error("Failed to fetch project data", error, {
          projectId,
          component: 'GenerateContentStep'
        });
        toast.error("Failed to fetch project data");
        setProjectHasContent(false);
        setProjectHasPrompts(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProjectData();
  }, [projectId]);

  useEffect(() => {
    let newErrorMessage = null;

    if (!projectHasContent || !projectHasPrompts) {
      const missingItems = [];
      if (!projectHasContent) missingItems.push("valid assets");
      if (!projectHasPrompts) missingItems.push("add prompts");

      newErrorMessage = `Please ${missingItems.join(
        " and "
      )} before generating content.`;
    } else if (isAssetsTokenExceeded || isPromptsTokenExceeded) {
      const exceededItems = [];
      if (isAssetsTokenExceeded) exceededItems.push("assets");
      if (isPromptsTokenExceeded) exceededItems.push("prompts");

      newErrorMessage = `Your ${exceededItems.join(
        " and "
      )} exceed the maximum token limit. Please reduce the size of your ${exceededItems.join(
        " or "
      )}.`;
    }

    setErrorMessage(newErrorMessage);
  }, [
    isAssetsTokenExceeded,
    isPromptsTokenExceeded,
    projectHasContent,
    projectHasPrompts,
  ]);

  return (
    <div>
      <GenerateStepHeader
        canGenerateContent={canGenerate}
        startGeneration={() => {}}
      />
      <GenerateStepBody
        isLoading={isLoading}
        isGenerating={isGenerating}
        generatedCount={generatedCount}
        totalPrompts={totalPrompts}
        errorMessage={errorMessage}
        generatedContent={generatedContent}
      />
    </div>
  );
}

export default GenerateContentStep;
