"use client";

import React, { useState, useEffect } from "react";
import { Prompt } from "@/server/db/schema";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  formatTokens,
  getPromptTokenCount,
  initializeTokenEncoder,
} from "@/utils/tokenHelper";
import { MAX_TOKENS_PROMPT } from "@/lib/constants";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

interface PromptContainerCardProps {
  prompt: Prompt;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onUpdate: (newPrompt: string) => void;
}

function PromptContainerCard({
  prompt,
  isActive,
  onClick,
  onDelete,
}: PromptContainerCardProps) {
  const [isExceeded, setIsExceeded] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    const calculateTokens = async () => {
      await initializeTokenEncoder();
      const newTokenCount = getPromptTokenCount(prompt.prompt || "");
      setTokenCount(newTokenCount);
      setIsExceeded(newTokenCount > MAX_TOKENS_PROMPT);
    };

    calculateTokens();
  }, [prompt]);
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border border-gray-200 bg-gray-50 rounded-2xl shadow-sm hover:border-main hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer",
        isActive && "bg-main/10 border-main/20"
      )}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base sm:text-lg text-main truncate">
          {prompt.name}
        </h3>
        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
          {prompt.prompt && <p className="truncate">{prompt.prompt}</p>}
          {!prompt.prompt && (
            <div className="bg-yellow-100 text-yellow-700 text-xs rounded-md px-1 py-0.5 sm:px-2 sm:py-1">
              <span className="hidden sm:inline">Prompt empty</span>
            </div>
          )}
          {(prompt.prompt || tokenCount !== 0) && (
            <>
              {prompt.prompt && <span>•</span>}
              <div className="flex items-center gap-1">
                <p
                  className={cn(
                    "text-xs sm:text-sm",
                    isExceeded ? "text-red-500 font-medium" : "text-gray-500"
                  )}
                >
                  Tokens: {formatTokens(tokenCount)}
                </p>
                {isExceeded && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="bg-red-100 text-red-500 text-xs rounded-md px-1 py-0.5 sm:px-2 sm:py-1">
                          <span className="hidden sm:inline">
                            Token Count Exceeded
                          </span>
                          <span className="sm:hidden">Exceeded</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs text-gray-600">
                          Current Tokens: {formatTokens(tokenCount)}, Maximum:{" "}
                          {formatTokens(MAX_TOKENS_PROMPT)}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-500 hover:text-red-600 hover:bg-red-50 ml-2"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default PromptContainerCard;
