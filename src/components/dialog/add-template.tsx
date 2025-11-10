"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

export function AddTemplateDialog() {
  const router = useRouter();

  const handleAddTemplate = () => {
    // Redirect to meme page for template creation
    router.push("/meme");
  };

  return (
    <Button onClick={handleAddTemplate} className="space-x-1">
      <span>Add Template</span> <ImagePlus size={18} />
    </Button>
  );
}
