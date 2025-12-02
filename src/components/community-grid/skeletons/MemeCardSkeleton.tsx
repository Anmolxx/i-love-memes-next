"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function MemeCardSkeleton() {
  const skeletonTags = Array.from({ length: 3 });

  return (
    <article className="border-1 border-[#D6C2FF] rounded-lg shadow-md p-2 flex flex-col animate-pulse min-w-[160px] max-w-full w-full overflow-hidden">
      <div className="relative w-full pb-[70%] rounded-lg mb-2 bg-black/10">
        <Skeleton className="absolute inset-0 rounded-lg" />
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>

      <Skeleton className="h-5 w-3/4 mb-1 rounded-md" />

      <Skeleton className="h-4 w-1/2 mb-2 rounded-md" />

      <div className="flex flex-wrap gap-2">
        {skeletonTags.map((_, idx) => (
          <Skeleton key={idx} className="h-5 w-16 rounded-full" />
        ))}
      </div>
    </article>
  );
}
