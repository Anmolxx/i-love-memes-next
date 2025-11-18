import CommunityGallery from "@/components/community-grid/CommunityGallery";
import { Suspense } from "react";

export default function CommunityPage() {
  return (
  <Suspense fallback={<div>Loading...</div>}>
      <CommunityGallery />
  </Suspense>
  )
}
