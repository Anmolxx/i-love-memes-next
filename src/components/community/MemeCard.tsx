"use client";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, Flag, Share2 } from "lucide-react";
import { InteractionType } from "@/utils/dtos/interaction.dto";
import { Tag } from "@/utils/dtos/tag.dto";

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
        <div className="text-lg font-semibold text-gray-800 truncate">{meme.title}</div>
        <div className="text-sm text-gray-500">
          by {meme.author ? ((meme.author.firstName || meme.author.lastName) ? `${meme.author.firstName ?? ""} ${meme.author.lastName ?? ""}`.trim() : meme.author.email) : "Anonymous"}
        </div>

        <div className={`flex flex-wrap items-center gap-2 mt-2 min-h-[1.5rem]`}>
          {displayedTags.map(tag => (
            <span key={tag.id} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
              #{tag.name}
            </span>
          ))}
          {hiddenTags.length > 0 && (
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium cursor-pointer">
              +{hiddenTags.length} more
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              aria-pressed={userVoteType === InteractionType.UPVOTE}
              onClick={() => handleVote(meme.id, InteractionType.UPVOTE)}
              disabled={isPosting || isDeleting}
              className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50 ${userVoteType === InteractionType.UPVOTE ? "bg-green-100 text-green-700" : ""}`}
            >
              <ThumbsUp size={18} />
              <span className="text-sm">{userVoteType === InteractionType.UPVOTE ? "You" : "Up"}</span>
            </button>

            <button
              aria-pressed={userVoteType === InteractionType.DOWNVOTE}
              onClick={() => handleVote(meme.id, InteractionType.DOWNVOTE)}
              disabled={isPosting || isDeleting}
              className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50 ${userVoteType === InteractionType.DOWNVOTE ? "bg-red-100 text-red-700" : ""}`}
            >
              <ThumbsDown size={18} />
              <span className="text-sm">Down</span>
            </button>

            <div className="text-sm font-medium text-gray-700 px-3 py-1 rounded-full border border-gray-200">{netScore}</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => shareMeme(meme)} title="Share" className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
              <Share2 size={18} />
            </button>

            <button
              onClick={() => setFlagMemeId(meme.id)}
              title={userHasFlagged ? "Meme flagged" : "Flag"}
              className={`p-2 rounded-full cursor-pointer transition-colors ${userHasFlagged ? "text-red-600 bg-red-200 hover:bg-red-300" : "hover:bg-gray-100"}`}
            >
              <Flag size={18} fill={userHasFlagged ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
