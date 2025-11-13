"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

export function CreateMemeDialog() {
  const router = useRouter();

  const handleAddMeme = () => {
    router.push("/meme");
  };

  return (
    <Button onClick={handleAddMeme} className="space-x-1 cursor-pointer">
      <span>Create Meme</span> <ImagePlus size={18} />
    </Button>
  );
}
