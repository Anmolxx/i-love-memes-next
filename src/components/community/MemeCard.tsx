"use client";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, Flag, Share2 } from "lucide-react";
import { InteractionType } from "@/utils/interaction.dto";
import { toast } from "sonner";

interface MemeCardProps {
  meme: any;
  handleVote: (id: string, type: InteractionType.UPVOTE | InteractionType.DOWNVOTE) => void;
  shareMeme: (meme: any) => void;
  setFlagMemeId: (id: string) => void;
  isPosting: boolean;
  isDeleting: boolean;
}

export function MemeCard({ meme, handleVote, shareMeme, setFlagMemeId, isPosting, isDeleting }: MemeCardProps) {
  return (
    <article className="bg-gray-200 rounded-2xl shadow-lg p-3 flex flex-col hover:shadow-xl transition-shadow">
      <Link
        href={`/community/${meme.slug}`}
        className="relative w-full pb-[100%] overflow-hidden rounded-xl bg-gray-100 mb-3"
      >
        <img
          src={meme.file?.path}
          alt={meme.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </Link>

      <div className="flex-1 flex flex-col">
        <div className="text-lg font-semibold text-gray-800 truncate">
          {meme.title}
        </div>
        <div className="text-sm text-gray-500">
          by {meme.author ? ((meme.author.firstName || meme.author.lastName) ? `${meme.author.firstName ?? ""} ${meme.author.lastName ?? ""}`.trim() : meme.author.email) : "Anonymous"}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              aria-pressed={meme.userVoteType === InteractionType.UPVOTE}
              onClick={() => handleVote(meme.id, InteractionType.UPVOTE)}
              disabled={meme.isVoting || isPosting || isDeleting}
              className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50 ${
                meme.userVoteType === InteractionType.UPVOTE ? "bg-green-100 text-green-700" : ""
              }`}
            >
              <ThumbsUp size={18} />
              <span className="text-sm">{meme.userVoteType === InteractionType.UPVOTE ? "You" : "Up"}</span>
            </button>

            <button
              aria-pressed={meme.userVoteType === InteractionType.DOWNVOTE}
              onClick={() => handleVote(meme.id, InteractionType.DOWNVOTE)}
              disabled={meme.isVoting || isPosting || isDeleting}
              className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50 ${
                meme.userVoteType === InteractionType.DOWNVOTE ? "bg-red-100 text-red-700" : ""
              }`}
            >
              <ThumbsDown size={18} />
              <span className="text-sm">Down</span>
            </button>

            <div className="text-sm font-medium text-gray-700 px-3 py-1 rounded-full border border-gray-200">
              {meme.netScore}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => shareMeme(meme)} title="Share" className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
              <Share2 size={18} />
            </button>

            <button
              onClick={() => setFlagMemeId(meme.id)}
              title={meme.userHasFlagged ? "Meme flagged" : "Flag"}
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                meme.userHasFlagged ? 'text-red-600 bg-red-200 hover:bg-red-300' : 'hover:bg-gray-100'
              }`}
            >
              <Flag size={18} fill={meme.userHasFlagged ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
