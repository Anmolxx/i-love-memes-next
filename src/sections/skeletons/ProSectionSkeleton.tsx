"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProSectionSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 animate-pulse">
      <div className="flex flex-col items-center text-center gap-6">
        {/* Top icon */}
        <Skeleton className="h-16 w-16 rounded-full" />

        {/* Heading */}
        <Skeleton className="h-10 w-64 sm:w-96 mx-auto rounded" />
        <Skeleton className="h-6 w-80 sm:w-96 mx-auto rounded" />

        {/* Subtext */}
        <Skeleton className="h-4 w-72 sm:w-96 mx-auto rounded mt-2" />

        {/* Feature cards */}
        <div className="mt-6 grid w-full gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl min-h-[18rem] sm:min-h-[20rem] md:min-h-[22rem] lg:min-h-[24rem] px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-14"
            >
              <Skeleton className="h-full w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
