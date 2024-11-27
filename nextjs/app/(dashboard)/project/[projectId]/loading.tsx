import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function ProjectLoading() {
  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 bg-white space-y-12 sm:space-y-16 lg:space-y-12">
      <div className="space-y-8 sm:space-y-12 lg:space-y-16">
        {/* Title section skeleton */}
        <div className="flex flex-row space-x-2 items-center">
          <Skeleton className="h-8 w-3/4 sm:h-10 lg:h-12" />
          <Skeleton className="h-8 w-8 rounded-full sm:h-10 sm:w-10" />
          <Skeleton className="h-8 w-8 rounded-full sm:h-10 sm:w-10" />
        </div>

        {/* Step bar skeleton */}
        <div className="w-full mt-6 sm:mt-0">
          {/* Mobile step bar */}
          <div className="flex md:hidden items-start w-full justify-between">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="w-8 h-8 rounded-full mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
          {/* Desktop step bar */}
          <div className="hidden md:flex items-center w-full">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex items-center flex-1 last:flex-grow-0"
              >
                <div className="flex flex-col items-center">
                  <Skeleton className="w-10 h-10 rounded-full mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
                {index < 3 && <Skeleton className="h-0.5 flex-grow mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content area skeleton */}
        <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm mt-8 sm:mt-0">
          <Skeleton className="h-6 sm:h-8 w-1/2 mb-4 sm:mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-10 sm:h-12 w-full" />
            <Skeleton className="h-10 sm:h-12 w-full" />
            <Skeleton className="h-10 sm:h-12 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
