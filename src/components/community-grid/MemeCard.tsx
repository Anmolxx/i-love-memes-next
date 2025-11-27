"use client";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, Flag, Share2 } from "lucide-react";
import { InteractionType } from "@/utils/dtos/interaction.dto";
import { Tag } from "@/utils/dtos/tag.dto";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface MemeCardProps {
  meme: any;
  handleVote: (id: string, type: InteractionType.UPVOTE | InteractionType.DOWNVOTE) => void;
  shareMeme: (meme: any) => void;
  setFlagMemeId: (id: string) => void;
  isPosting: boolean;
  isDeleting: boolean;
}

interface UserInteraction {
  type: InteractionType;
  createdAt: string;
  reason?: string | null;
  note?: string | null;
}

export function MemeCard({ meme, handleVote, shareMeme, setFlagMemeId, isPosting, isDeleting }: MemeCardProps) {
  const activeTags: Tag[] = meme.tags?.filter((tag: Tag) => !tag.deletedAt) ?? [];
  const displayedTags = activeTags.slice(0, 3);
  const hiddenTags = activeTags.slice(3);

  const interactions: UserInteraction[] = meme.interactionSummary?.userInteractions ?? [];

  const vote = interactions.find(
    (i): i is UserInteraction & { type: InteractionType.UPVOTE | InteractionType.DOWNVOTE } =>
      i.type === InteractionType.UPVOTE || i.type === InteractionType.DOWNVOTE
  );

  const userVoteType: InteractionType.UPVOTE | InteractionType.DOWNVOTE | "NONE" = vote?.type ?? "NONE";
  const userHasFlagged = (meme.interactionSummary?.flagCount ?? 0) > 0;
  const netScore = meme.interactionSummary?.netScore ?? 0;

  return (
      <article className="border-1 border-[#D6C2FF] rounded-lg shadow-md p-2 flex flex-col hover:shadow-lg transition-shadow group">
        {/* Meme Image */}
        <Link
          href={`/community/${meme.slug}`}
          className="relative w-full pb-[70%] overflow-hidden rounded-lg mb-2 bg-black"
        >
          <img
            src={meme.file?.path}
            alt={meme.title}
            className="absolute inset-0 w-full h-full object-contain"
            loading="lazy"
          />
        </Link>
  
        {/* Title & Author */}
        <div className="flex-1 flex flex-col px-1 py-2 gap-1 justify-between">
          <Link
              href={`/community/${meme.slug}`}
               className="inline-block  transition-colors w-fit  text-base sm:text-lg font-semibold text-[#1F1147]    "
              >
              {meme.title}
            </Link>
          <div className="text-gray-600 text-sm line-clamp-2 pb-3">
            by {meme.author ? ((meme.author.firstName || meme.author.lastName) ? `${meme.author.firstName ?? ""} ${meme.author.lastName ?? ""}`.trim() : meme.author.email) : "Anonymous"}
          </div>
  
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1">
            {displayedTags.map((tag) => (
                    <Link
                        key={tag.id}
                        href={`/community/?tags=${tag.name}`}
                        className="text-sm bg-purple-100 text-purple-800 px-6 py-1  rounded-xl font-medium hover:bg-purple-200 transition"
                    >
                        #{tag.name}
                    </Link>
                ))}
            
                {hiddenTags.length > 0 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md font-medium cursor-pointer hover:bg-gray-300 transition">
                                    +{hiddenTags.length} more
                                </span>
                            </TooltipTrigger>
                            <TooltipContent
                                side="top"
                                className="bg-white text-black shadow-lg p-2 rounded-md border border-gray-200"
                            >
                                <div className="flex flex-wrap gap-2 max-w-[200px]">
                                    {hiddenTags.map((tag) => {
                                        const hasName = tag.name && tag.name.length > 0;
                                        return hasName ? (
                                            <Link
                                                key={tag.id}
                                                href={`/community/?tags=${tag.name}`}
                                                target="_blank"
                                                className="hover:opacity-80 transition-opacity py-0.5"
                                            >
                                                <span
                                                    className="text-xs px-2 py-1 rounded-lg font-medium border border-transparent bg-gray-200 text-gray-800"
                                                >
                                                    #{tag.name}
                                                </span>
                                            </Link>
                                        ) : (
                                            <span key={tag.id} className="text-xs px-2 py-1 rounded-lg font-medium border border-transparent bg-gray-200 text-gray-800">
                                                #Invalid Tag
                                            </span>
                                        );
                                    })}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
          </div>
  
          {/* Actions */}
          <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1">
              <button
                aria-pressed={userVoteType === InteractionType.UPVOTE}
                onClick={() => handleVote(meme.id, InteractionType.UPVOTE)}
                disabled={isPosting || isDeleting}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-gray-200 cursor-pointer disabled:opacity-50 ${userVoteType === InteractionType.UPVOTE ? "bg-green-100 text-green-700" : ""}`}
              >
                <ThumbsUp size={16} />
                <span className="text-[14px]">{userVoteType === InteractionType.UPVOTE ? "You" : "Up"}</span>
              </button>
  
              <button
                aria-pressed={userVoteType === InteractionType.DOWNVOTE}
                onClick={() => handleVote(meme.id, InteractionType.DOWNVOTE)}
                disabled={isPosting || isDeleting}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-gray-200 cursor-pointer disabled:opacity-50 ${userVoteType === InteractionType.DOWNVOTE ? "bg-red-100 text-red-700" : ""}`}
              >
                <ThumbsDown size={16} />
                <span className="text-[14px]">Down</span>
              </button>
  
              <div className="text-xs font-medium text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">{netScore}</div>
            </div>
  
            <div className="flex items-center gap-1">
              <button onClick={() => shareMeme(meme)} title="Share" className="p-1 rounded-full hover:bg-gray-200 cursor-pointer">
                <Share2 size={16} />
              </button>
  
              <button
                onClick={() => setFlagMemeId(meme.id)}
                title={userHasFlagged ? "Meme flagged" : "Flag"}
                className={`p-1 rounded-full cursor-pointer transition-colors ${userHasFlagged ? "text-red-600 bg-red-200 hover:bg-red-300" : "hover:bg-gray-200"}`}
              >
                <Flag size={16} fill={userHasFlagged ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }