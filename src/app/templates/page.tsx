import React, { Suspense } from 'react'
import { TemplateGallery } from "@/components/template-grid/TemplatesPage"

export default function CommunityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
          <TemplateGallery/>
    </Suspense>
  )
}