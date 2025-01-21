"use client";

import React from "react";
import { Prompt } from "@/server/db/schema";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { formatTokens } from "@/utils/tokenHelper";
import { MAX_TOKENS_PROMPT } from "@/lib/constants";

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
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border border-gray-200 bg-gray-50 rounded-2xl shadow-sm hover:border-main hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer",
        isActive && "bg-main/10 border-main/20"
      )}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-main truncate">{prompt.name}</h3>
        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
          {prompt.prompt && <p className="truncate">{prompt.prompt}</p>}
          {(prompt.prompt || prompt.tokenCount !== undefined) && (
            <>
              {prompt.prompt && <span>•</span>}
              <p
                className={cn(
                  "text-xs sm:text-sm",
                  (prompt.tokenCount || 0) > MAX_TOKENS_PROMPT
                    ? "text-red-500 font-medium"
                    : "text-gray-500"
                )}
              >
                Tokens: {formatTokens(prompt.tokenCount || 0)}
                {(prompt.tokenCount || 0) > MAX_TOKENS_PROMPT && " (Exceeded)"}
              </p>
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
