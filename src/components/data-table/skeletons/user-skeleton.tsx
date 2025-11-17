"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function UsersTableSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-1 gap-2">
          <Skeleton className="h-10 w-1/4 rounded-md" />
          <Skeleton className="h-10 w-1/8 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20 rounded-md" />
          <Skeleton className="h-10 w-20 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-[32px_repeat(5,1fr)_32px] gap-2 mt-5">
        <Skeleton className="h-6 w-6 rounded-md" />
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-6 w-full rounded-md" />
        ))}
        <Skeleton className="h-6 w-6 rounded-md" />
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div key={idx} className="grid grid-cols-[32px_repeat(5,1fr)_32px] gap-2">
            <Skeleton className="h-8 w-6 rounded-md" />
            {Array.from({ length: 5 }).map((_, cIdx) => (
              <Skeleton key={cIdx} className="h-8 w-full rounded-md" />
            ))}
            <Skeleton className="h-8 w-6 rounded-md" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <Skeleton className="h-8 w-16 rounded-md mr-5" />
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-8 w-8 rounded-md" />
        ))}
      </div>
    </div>
  );
}
