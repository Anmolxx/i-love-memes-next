import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export function TemplateGallerySkeleton() {
  const skeletonCards = Array.from({ length: 3 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {skeletonCards.map((_, index) => (
        <div
          key={index}
          className="border rounded-lg shadow-sm overflow-hidden flex flex-col"
        >
          <Skeleton className="w-full h-56" />
          
          <div className="p-4 flex flex-col gap-2 flex-1">
        
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mb-4" />
            <Skeleton className="h-10 w-full mt-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}