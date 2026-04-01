import CommunityGallery from "@/components/community-grid/CommunityGallery";
import { Suspense } from "react";

export default function CommunityPage() {
  return (
  <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        </div>
      }
    >
      <CommunityGallery />
  </Suspense>
  )
}
