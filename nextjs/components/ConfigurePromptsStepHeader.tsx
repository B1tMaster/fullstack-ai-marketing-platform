"use client";

import React from "react";
import { Button } from "./ui/button";
import { LayoutTemplate, Loader2, Plus } from "lucide-react";

interface ConfigurePromptsStepHeaderProps {
  isCreatingPrompt: boolean;
  isImportingTemplate: boolean;
  handlePromptCreate: () => void;
}

function ConfigurePromptsStepHeader({
  handlePromptCreate,
  isCreatingPrompt,
  isImportingTemplate,
}: ConfigurePromptsStepHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start justify-between">
      <h2 className="text-xl md:text-2xl lg:text-2xl font-bold mb-4 sm:mb-0">
        Step 3: Prompts
      </h2>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
        {/* TODO: COME BACK TO AFTER TEMPLATE MODULE */}
        <Button className="bg-main/10 text-main font-semibold hover:bg-main/15 text-sm sm:text-base rounded-lg w-full sm:w-auto h-8 sm:h-10">
          <LayoutTemplate className="h-4 w-4 mr-2" strokeWidth={3} />
          {isImportingTemplate ? "Importing..." : "Load Template"}
        </Button>
        <Button
          onClick={handlePromptCreate}
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
    </div>
  );
}

export default ConfigurePromptsStepHeader;
