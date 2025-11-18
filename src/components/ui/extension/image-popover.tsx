"use client";

import * as React from "react";
import { PopoverContent } from "@/components/ui/popover";
import { Portal } from "./portal"; // custom portal

interface ImagePopoverProps {
  src: string;
  alt?: string;
}

export function ImagePopover({ src, alt = "Image" }: ImagePopoverProps) {
  return (
    <Portal>
      <PopoverContent
        side="right"
        align="center"
        className="p-0 bg-transparent border-0 shadow-lg"
      >
        <div className="border border-black dark:border-white rounded-md overflow-hidden ml-5">
          <img
            src={src}
            alt={alt}
            className="block max-w-xs max-h-[80vh] w-full h-full object-contain"
          />
        </div>
      </PopoverContent>
    </Portal>
  );
}
