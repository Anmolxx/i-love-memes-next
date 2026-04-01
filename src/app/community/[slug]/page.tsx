"use client";

import React, { Suspense } from "react";
import MemePage from "@/components/community-meme/MemePage";

interface PageProps {
  params: { slug: string };
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        </div>
      }
    >
      <MemePage />
    </Suspense>
  );
}
