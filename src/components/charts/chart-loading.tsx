"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ChartLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-[60%] w-full rounded-md" />
      <div className="flex gap-2 w-full">
        <Skeleton className="h-3 flex-1" />
        <Skeleton className="h-3 flex-1" />
        <Skeleton className="h-3 flex-1" />
      </div>
    </div>
  );
}
