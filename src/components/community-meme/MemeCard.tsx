// src/components/MemePage/MemeCard.tsx
import React from 'react';
import { ThumbsUp, ThumbsDown, Flag, Share2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Meme } from "@/utils/dtos/meme.dto";
import TagDisplay from './TagDisplay'; 

interface MemeCardProps {
  meme: Meme;
  vote: (newVote: number) => void;
  shareMeme: () => Promise<void>;
  setFlagMemeId: (id: string | null) => void;
}

export default function MemeCard({ meme, vote, shareMeme, setFlagMemeId }: MemeCardProps) {
  const activeTags = meme.tags?.filter(tag => !tag.deletedAt) ?? [];
  const displayedTags = activeTags.slice(0, 3) ?? [];
  const hiddenTags = activeTags.slice(3) ?? [];
  const authorName = meme.author
    ? (meme.author.firstName || meme.author.lastName)
      ? `${meme.author.firstName ?? ""} ${meme.author.lastName ?? ""}`.trim()
      : meme.author.email
    : "Anonymous";

  return (
    <div className="bg-gray-200 rounded-2xl shadow-lg p-3 flex flex-col hover:shadow-xl transition-shadow w-full max-w-[700px] mx-auto">
      <div className="relative w-full h-[500px] overflow-hidden rounded-xl bg-gray-100">
        <img
          src={meme.file?.path}
          alt={meme.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="mt-3 flex-1 flex flex-col gap-2">
        <div className="text-lg font-semibold text-gray-800 truncate">{meme.title}</div>
        <div className="text-sm text-gray-500">by {authorName}</div>

        {meme.tags && meme.tags.length > 0 && (
          <TagDisplay displayedTags={displayedTags} hiddenTags={hiddenTags} />
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => vote(1)} className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer">
              <ThumbsUp size={18} /> Up
            </button>
            <button onClick={() => vote(-1)} className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer">
              <ThumbsDown size={18} /> Down
            </button>
            <div className="text-sm font-medium text-gray-700 px-3 py-1 rounded-full border border-gray-200">
              {meme.interactionSummary?.netScore ?? 0}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={shareMeme} className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
              <Share2 size={18} />
            </button>
            <button onClick={() => setFlagMemeId(meme.id)} className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
              <Flag size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}