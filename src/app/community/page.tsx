import CommunityGallery from "@/components/community/Gallery";
import { Suspense } from "react";

export default function CommunityPage() {
  <Suspense fallback={<div>Loading...</div>}>
      <CommunityGallery />
  </Suspense>
}
