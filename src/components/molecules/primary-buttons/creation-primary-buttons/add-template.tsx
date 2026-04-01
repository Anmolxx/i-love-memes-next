"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

export function AddTemplateDialog() {
  const router = useRouter();

  const handleAddTemplate = () => {
    window.open("/meme", "_blank");
  };

  return (
    <Button onClick={handleAddTemplate} className="space-x-1 cursor-pointer">
      <span>Add Template</span> <ImagePlus size={18} />
    </Button>
  );
}
