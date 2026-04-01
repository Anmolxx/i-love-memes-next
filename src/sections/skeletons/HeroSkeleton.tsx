"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <section className="w-full relative flex items-center justify-center">
      <div className="mx-auto max-w-6xl px-4 pt-12 md:pt-16 pb-20 md:pb-28 grid items-center gap-8 md:grid-cols-2">
        {/* Text content skeleton */}
        <div className="space-y-4 md:space-y-6 text-center md:text-left">
          <Skeleton className="h-12 md:h-16 w-64 md:w-80 mx-auto md:mx-0" />
          <Skeleton className="h-5 md:h-6 w-52 md:w-64 mx-auto md:mx-0" />
          <Skeleton className="h-10 w-40 mx-auto md:mx-0 rounded-full" />
        </div>

        {/* Image content skeleton */}
        <div className="relative order-first md:order-last">
          <Skeleton className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto aspect-[4/2.5] rounded-xl" />
        </div>
      </div>
    </section>
  );
}
