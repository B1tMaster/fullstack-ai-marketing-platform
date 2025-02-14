import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionLoading() {
  return (
    <div className="max-w-screen-lg mx-auto p-4 sm:p-6 lg:p-8 bg-white space-y-6">
      {/* Title skeleton */}
      <Skeleton className="h-8 w-1/2 sm:h-10" />

      {/* Plan section skeleton */}
      <div className="space-y-4">
        {/* Status label */}
        <Skeleton className="h-4 w-24 sm:h-5" />

        {/* Status value */}
        <Skeleton className="h-5 w-20 sm:h-6" />

        {/* Next billing label */}
        <Skeleton className="h-4 w-40 sm:h-5" />

        {/* Next billing value */}
        <Skeleton className="h-5 w-32 sm:h-6" />
      </div>

      {/* Manage Subscription button skeleton */}
      <Skeleton className="h-10 w-48 rounded-md" />
    </div>
  );
}
