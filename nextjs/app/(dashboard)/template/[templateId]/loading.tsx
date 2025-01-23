import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TemplateLoading() {
  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 bg-white space-y-12 sm:space-y-16 lg:space-y-12">
      <div className="space-y-8 sm:space-y-12 lg:space-y-16">
        {/* Title section skeleton */}
        <div className="flex flex-row space-x-2 items-center">
          <Skeleton className="h-8 w-3/4 sm:h-10 lg:h-12" />
          <Skeleton className="h-8 w-8 rounded-full sm:h-10 sm:w-10" />
          <Skeleton className="h-8 w-8 rounded-full sm:h-10 sm:w-10" />
        </div>

        {/* Content area skeleton */}
        <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6">
            <Skeleton className="h-8 w-1/4 mb-3 sm:mb-0" />
            <Skeleton className="h-8 sm:h-10 w-full sm:w-36" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
