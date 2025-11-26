"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function MemePageSkeleton() {
  return (
    <div className="flex min-h-svh w-full flex-col bg-gray-50">

      {/* NAVBAR */}
      <div className="sticky top-0 bg-white/70 backdrop-blur z-50">
        <div className="max-w-[110rem] px-4 flex items-center gap-6 mx-auto py-4 mb-2">
          <Skeleton className="h-10 w-full max-w-lg rounded-xl bg-gray-300" />
          <Skeleton className="h-10 w-32 rounded-xl bg-gray-300" />
        </div>
      </div>

      {/* MAIN 3-COLUMN LAYOUT */}
      <div className="max-w-6xl mx-auto p-4 flex flex-col md:flex-row gap-6 mt-5">

        {/* LEFT COLUMN → MEME CARD */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-200 rounded-2xl shadow-lg p-3 w-full flex flex-col h-[500px]">

            <Skeleton className="w-full h-3/5 rounded-xl bg-gray-300" /> {/* Image */}
            <Skeleton className="h-6 w-64 mt-4 bg-gray-300" />            {/* Title */}
            <Skeleton className="h-4 w-32 mt-2 bg-gray-300" />            {/* Author */}
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-20 rounded-full bg-gray-300" />
              <Skeleton className="h-6 w-20 rounded-full bg-gray-300" />
              <Skeleton className="h-6 w-20 rounded-full bg-gray-300" />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20 rounded-full bg-gray-300" />
                <Skeleton className="h-8 w-20 rounded-full bg-gray-300" />
                <Skeleton className="h-8 w-10 rounded-full bg-gray-300" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full bg-gray-300" />
                <Skeleton className="h-8 w-8 rounded-full bg-gray-300" />
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN → COMMENTS (same height as meme card) */}
        <div className="flex-1 flex flex-col h-[500px] max-w-[700px]">
          <div className="bg-gray-200 rounded-2xl shadow-lg p-3 flex flex-col gap-4 h-full">

            <Skeleton className="h-6 w-48 bg-gray-300" />

            <Skeleton className="h-24 w-full bg-gray-200 rounded-xl" />
            <Skeleton className="h-24 w-full bg-gray-200 rounded-xl" />
            <Skeleton className="h-24 w-full bg-gray-200 rounded-xl" />

          </div>
        </div>

        {/* RIGHT COLUMN → ACTIONS */}
        <div className="w-full md:w-[260px] flex flex-col gap-4">

          <Skeleton className="h-12 w-full rounded-full bg-gray-300" />

          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
            <Skeleton className="h-4 w-40 bg-gray-300 mb-2" />
            <Skeleton className="h-4 w-56 bg-gray-300 mb-3" />
            <Skeleton className="h-4 w-32 bg-gray-300 mb-2" />
            <Skeleton className="h-4 w-full bg-gray-300" />
            <Skeleton className="h-4 w-3/4 bg-gray-300 mt-2" />
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-20 px-4 max-w-6xl mx-auto pb-10">
        <Skeleton className="h-8 w-full bg-gray-300 rounded-xl" />
        <Skeleton className="h-6 w-1/3 mt-2 bg-gray-300 rounded-xl" />
      </div>
    </div>
  );
}
