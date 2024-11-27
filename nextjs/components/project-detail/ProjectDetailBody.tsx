import React, { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";

interface ProjectDetailBodyProps {
  currentStep: number;
  projectId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  steps: { component: React.LazyExoticComponent<React.ComponentType<any>> }[];
}

function ProjectDetailBody({
  steps,
  currentStep,
  projectId,
}: ProjectDetailBodyProps) {
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <Suspense fallback={<StepSkeleton />}>
      <CurrentStepComponent projectId={projectId} />
    </Suspense>
  );
}

export default ProjectDetailBody;

const StepSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 sm:h-12 w-full" />
      <Skeleton className="h-10 sm:h-12 w-full" />
      <Skeleton className="h-10 sm:h-12 w-3/4" />
    </div>
  );
};
