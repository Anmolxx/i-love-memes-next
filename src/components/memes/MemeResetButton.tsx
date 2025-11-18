"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MemeResetButtonProps {
  onReset: () => void;
}

const MemeResetButton: React.FC<MemeResetButtonProps> = ({ onReset }) => {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const handleReset = () => {
    onReset();
    setIsResetDialogOpen(false);
    toast.info("Canvas has been reset");
  };

  return (
    <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className="rounded-full cursor-pointer h-10 px-4 md:px-6 border-[#1E085C] text-[#1E085C] text-sm md:text-base"
          variant="outline"
        >
          Reset
          <RotateCcw className="w-4 h-4 ml-2" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset your meme?</AlertDialogTitle>
          <AlertDialogDescription>
            This will clear all text, images, and edits from your current meme. Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} className="cursor-pointer">
            Yes, Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MemeResetButton;