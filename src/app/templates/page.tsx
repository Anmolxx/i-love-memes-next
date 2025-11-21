import React, { Suspense } from 'react';
import { TemplateGallery } from "@/components/template-grid/TemplatesPage";

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        </div>
      }
    >
      <TemplateGallery />
    </Suspense>
  );
}
