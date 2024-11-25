// app/(dashboard)/projects/loading.tsx

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full">
      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12 mt-2 space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-0">
            <Skeleton className="h-8 sm:h-10 lg:h-12 w-48 sm:w-64 lg:w-80" />
            <Skeleton className="h-4 sm:h-5 lg:h-6 w-64 sm:w-80 lg:w-96" />
          </div>
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
        <div className="grid gap-4 sm:gap-6 md:gap-8 lg:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-48 sm:h-56 rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
