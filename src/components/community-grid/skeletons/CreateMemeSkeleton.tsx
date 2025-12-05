"use client";
import { Skeleton } from "@/components/ui/skeleton";

export function CreateMemeSkeleton() {
  return (
    <div className="bg-gradient-to-r from-[#CD01BA]/30 to-[#E20317]/30 p-4 rounded-2xl shadow border-1 animate-pulse">
      <div className="flex flex-col gap-3 text-center">
        <Skeleton className="h-5 w-3/4 mx-auto rounded-md" /> 
        <Skeleton className="h-10 w-full mx-auto rounded-full" /> 
      </div>
    </div>
  );
}
