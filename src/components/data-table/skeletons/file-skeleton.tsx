"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function FilesTableSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {/* Toolbar Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-1 gap-2">
          <Skeleton className="h-10 w-1/4 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>

      {/* Gallery Skeleton: 8 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="rounded-md border p-3 flex flex-col">
          
            <Skeleton className="w-full h-40 rounded-md mb-2" />
            <Skeleton className="w-6 h-6 mb-2" />
            <div className="mt-auto flex justify-between items-center">
              <Skeleton className="w-6 h-6 rounded-md" />
              <Skeleton className="w-6 h-6 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-end gap-2 mt-4">
          <Skeleton className="h-8 w-16 rounded-md mr-5" />
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-8 w-8 rounded-md" />
          ))}
      </div>
    </div>
  );
}
