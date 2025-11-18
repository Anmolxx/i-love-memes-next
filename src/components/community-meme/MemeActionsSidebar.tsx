// src/components/MemePage/MemeActionsSidebar.tsx
import React from 'react';
import Link from "next/link";
import { Meme } from "@/utils/dtos/meme.dto";

interface MemeActionsSidebarProps {
  meme: Meme;
  handleCaptionClick: () => void;
}

export default function MemeActionsSidebar({ meme, handleCaptionClick }: MemeActionsSidebarProps) {
  return (
    <div className="flex flex-col gap-4 w-full md:flex-[1]">
      <div
        onClick={handleCaptionClick}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium text-white shadow-sm cursor-pointer"
        style={{
          background: "linear-gradient(90deg,#CD01BA,#E20317)",
          boxShadow:
            "0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)",
        }}
      >
        Caption this Meme
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 text-sm">
        <div className="flex flex-col gap-1">
          <p className="text-gray-700 text-base">
            Created with{" "}
            <Link
              href="/meme"
              className="text-[#4b087e] font-semibold hover:underline cursor-pointer"
            >
              ILoveMemes Meme Generator
            </Link>
          </p>
          <span className="font-semibold text-gray-800">
            IMAGE DESCRIPTION:
          </span>
          <p className="text-gray-700 text-base">{meme.description}</p>
        </div>
      </div>
    </div>
  );
}