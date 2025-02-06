import React from "react";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";

interface GenerateStepHeaderProps {
  canGenerateContent: boolean;
  startGeneration: () => void;
}

function GenerateStepHeader({
  startGeneration,
  canGenerateContent,
}: GenerateStepHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 lg:mb-6">
      <h2 className="text-xl md:text-2xl lg:text-2xl font-bold text-gray-800 mb-3 lg:mb-0">
        Step 3: Generate Content
      </h2>
      <Button
        onClick={startGeneration}
        disabled={!canGenerateContent}
        className="bg-main/10 text-main font-semibold hover:bg-main/15 text-sm lg:text-md rounded-lg w-full lg:w-auto"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Generate Content
      </Button>
    </div>
  );
}

export default GenerateStepHeader;
