"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function FooterSkeleton() {
  return (
    <footer className="border-t border-black/10 bg-[#F9ECFE] animate-pulse">
      <div className="mx-auto max-w-[76rem] px-4 py-8">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Column 1 */}
          <div className="md:col-span-4 text-center md:text-left space-y-3">
            <Skeleton className="h-10 w-[180px] mx-auto md:mx-0 rounded" />
            <Skeleton className="h-3 w-40 mx-auto md:mx-0 rounded" />
            <div className="mt-5 flex items-center justify-center md:justify-start gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>

          {/* Column 2 */}
          <div className="md:col-span-4 text-center md:text-left space-y-3">
            <Skeleton className="h-4 w-32 mx-auto md:mx-0 rounded" />
            <Skeleton className="h-3 w-28 mx-auto md:mx-0 rounded" />
            <Skeleton className="h-3 w-32 mx-auto md:mx-0 rounded" />
            <Skeleton className="h-3 w-36 mx-auto md:mx-0 rounded" />
            <Skeleton className="h-3 w-28 mx-auto md:mx-0 rounded" />
          </div>

          {/* Column 3 */}
          <div className="md:col-span-4 text-center md:text-left space-y-3">
            <Skeleton className="h-4 w-28 mx-auto md:mx-0 rounded" />
            <Skeleton className="h-3 w-44 mx-auto md:mx-0 rounded" />
            <div className="mt-4 flex items-center justify-center md:justify-start gap-2">
              <Skeleton className="h-10 w-[200px] rounded-full" />
              <Skeleton className="h-10 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-40 mx-auto md:mx-0 rounded mt-3" />
          </div>
        </div>

        <hr className="mt-8 border-t border-black/10" />

        <div className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
            <Skeleton className="order-2 md:order-1 h-3 w-48 mx-auto md:mx-0 rounded" />
            <div className="hidden md:block" />
            <div className="order-1 md:order-3 flex justify-center md:justify-end gap-6">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
