import { cn } from "@/lib/utils";
import React from "react";

interface ProjectDetailStepperProps {
  currentStep: number;
  handleStepClick: (index: number) => void;
  steps: { name: string; tab: string }[];
}

function ProjectDetailStepper({
  currentStep,
  handleStepClick,
  steps,
}: ProjectDetailStepperProps) {
  // TODO: Grab tab query from url.
  // TODO: Create a state for the current tab.
  // TODO: use the fetched tab query to set the current tab state.

  // TODO: Create a function to handle tab changes.

  return (
    <>
      {/* MOBILE STEP BAR */}
      <div className="md:hidden flex items-start w-full">
        {steps.map((step, index) => (
          <div
            key={step.tab}
            className="flex-1 flex items-center justify-center"
          >
            <button
              onClick={() => handleStepClick(index)}
              className={cn(
                "flex flex-col items-center w-full",
                index === currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold mb-1",
                  index === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </span>
              <span className="text-xs font-semibold break-words w-full text-center">
                {step.name}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* DESKTOP STEP BAR */}
      <div className="hidden md:flex items-start w-full">
        {steps.map((step, index) => (
          <div
            key={step.tab}
            className="flex items-center flex-1 last:flex-grow-0"
          >
            <button
              onClick={() => handleStepClick(index)}
              className={cn(
                "flex flex-col items-center",
                index === currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold mb-2",
                  index === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </span>
              <span className="text-sm font-semibold">{step.name}</span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-grow h-0.5 mx-2",
                  index < currentStep ? "bg-primary" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default ProjectDetailStepper;
