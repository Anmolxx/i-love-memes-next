"use client";
import { Skeleton } from "@/components/ui/skeleton";

export function TopMemeSidebarSkeleton() {
  return (
    <div className="p-3 rounded-2xl shadow bg-[rgb(249,236,254)] border-2 border-[#F95FFF] animate-pulse">
      <Skeleton className="h-6 w-24 mb-3 rounded-md" /> 
      <Skeleton className="w-full aspect-square rounded-xl mb-2" /> 
      <Skeleton className="h-4 w-3/4 mb-2 rounded-md" /> 
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}
