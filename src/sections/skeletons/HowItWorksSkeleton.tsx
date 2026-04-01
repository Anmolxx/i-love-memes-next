"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function HowItWorksSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 mb-20">
      {/* Heading Skeleton */}
      <div className="mb-10 space-y-2 text-center">
        <Skeleton className="h-10 md:h-12 w-48 md:w-64 mx-auto" />
        <Skeleton className="h-5 w-64 mx-auto" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center p-6 bg-white border border-black/10 rounded-lg shadow"
          >
            <Skeleton className="h-10 w-10 rounded-full mb-4" />
            <Skeleton className="h-5 w-32 rounded mb-2" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}
