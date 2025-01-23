import React from "react";
import PromptList from "./PromptsList";
import { Button } from "./ui/button";
import { Loader2, Plus } from "lucide-react";
import { CommonPrompt } from "@/interfaces/CommonPrompt";

interface TemplateDetailBodyProps {
  handleCreatePrompt: () => void;
  isCreatingPrompt: boolean;
  prompts: CommonPrompt[];
  isLoading: boolean;
  setDeletePromptId: React.Dispatch<React.SetStateAction<string | null>>;
}

function TemplateDetailBody({
  handleCreatePrompt,
  isCreatingPrompt,
  prompts,
  isLoading,
  setDeletePromptId,
}: TemplateDetailBodyProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6">
        <h2 className="text-xl lg:text-2xl font-bold mb-3 sm:mb-0">Prompts</h2>
        <Button
          onClick={handleCreatePrompt}
          disabled={isCreatingPrompt}
          className="bg-main/10 text-main font-semibold hover:bg-main/15 text-sm sm:text-base rounded-lg w-full sm:w-auto h-8 sm:h-10"
        >
          {isCreatingPrompt ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={3} />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" strokeWidth={3} />
              Add Prompt
            </>
          )}
        </Button>
      </div>
      <PromptList
        prompts={prompts}
        isLoading={isLoading}
        setDeletePromptId={setDeletePromptId}
      />
    </div>
  );
}

export default TemplateDetailBody;
