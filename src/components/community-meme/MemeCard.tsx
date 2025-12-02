"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, Flag, Share2 } from "lucide-react";
import { Meme } from "@/utils/dtos/meme.dto"; 
import TagDisplay from './TagDisplay'; 
import { usePostInteractionMutation, useDeleteInteractionMutation } from '@/redux/services/interaction';
import { toast } from 'sonner';

enum InteractionType {
    UPVOTE = "UPVOTE",
    DOWNVOTE = "DOWNVOTE",
    FLAG = "FLAG",
}

interface MemeCardProps {
    meme: Meme;
    vote: (newVote: number) => void;
    shareMeme: (meme: Meme) => Promise<void>;
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

    const userInteractions: any[] = meme.interactionSummary?.userInteractions ?? [];
    const userVoteInteraction = userInteractions.find(i => i.type === InteractionType.UPVOTE || i.type === InteractionType.DOWNVOTE);
    const userVoteType: InteractionType.UPVOTE | InteractionType.DOWNVOTE | "NONE" = userVoteInteraction?.type ?? "NONE";
    const userVoteId = userVoteInteraction?.id;
    const userFlagInteraction = userInteractions.find(i => i.type === InteractionType.FLAG);
    const userHasFlagged = !!userFlagInteraction;

    const [localVote, setLocalVote] = useState<InteractionType.UPVOTE | InteractionType.DOWNVOTE | "NONE">(userVoteType);
    const [hasFlagged, setHasFlagged] = useState(userHasFlagged);

    const [postInteraction] = usePostInteractionMutation();
    const [deleteInteraction] = useDeleteInteractionMutation();

    const handleVote = async (voteType: InteractionType.UPVOTE | InteractionType.DOWNVOTE) => {
        try {
            if (localVote === voteType) {
                if (userVoteId) await deleteInteraction({ memeId: meme.id, type: voteType }).unwrap();
                setLocalVote("NONE");
            } else if (localVote === "NONE") {
                await postInteraction({ memeId: meme.id, type: voteType }).unwrap();
                setLocalVote(voteType);
            } else {
                if (userVoteId) await deleteInteraction({ memeId: meme.id, type: localVote }).unwrap();
                await postInteraction({ memeId: meme.id, type: voteType }).unwrap();
                setLocalVote(voteType);
            }
        } catch {
        }
    };

    const handleFlagClick = () => {
        setFlagMemeId(meme.id); 
    };

    return (
        <div className="border-1 border-[#D6C2FF] rounded-lg shadow-md p-3 flex flex-col hover:shadow-lg transition-shadow group relative min-w-[300px] w-full overflow-hidden">
            <Link 
                href={`/community/${meme.slug}`}
                className="relative w-full pb-[70%] overflow-hidden rounded-xl bg-black"
            >
                <img
                    src={meme.file?.path}
                    alt={meme.title}
                    className="absolute inset-0 w-full h-full object-contain"
                />

                {/* Hover action overlay placed inside image container so it is clipped */}
                <div className="mt-0 items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute left-2 right-2 bottom-2 z-20 flex flex-wrap gap-2 bg-black/70 text-white py-1 rounded-md backdrop-blur-sm px-3 max-w-full">
                  <div className="flex items-center gap-1">
                    <button
                      aria-pressed={localVote === InteractionType.UPVOTE}
                      onClick={(e) => { e.stopPropagation(); handleVote(InteractionType.UPVOTE); }}
                      className={`p-2 rounded-full hover:bg-white/30 cursor-pointer disabled:opacity-50 transition-colors ${localVote === InteractionType.UPVOTE ? "bg-green-500 text-white hover:bg-green-600" : ""}`}
                    >
                      <ThumbsUp size={16} />
                    </button>

                    <button
                      aria-pressed={localVote === InteractionType.DOWNVOTE}
                      onClick={(e) => { e.stopPropagation(); handleVote(InteractionType.DOWNVOTE); }}
                      className={`p-2 rounded-full hover:bg-white/30 cursor-pointer disabled:opacity-50 transition-colors ${localVote === InteractionType.DOWNVOTE ? "bg-red-500 text-white hover:bg-red-600" : ""}`}
                    >
                      <ThumbsDown size={16} />
                    </button>

                    <div className="text-xs font-medium text-white px-2 py-0.5 rounded-full border border-white/50">{meme.interactionSummary?.netScore ?? 0}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); shareMeme(meme); }} title="Share" className="p-2 rounded-full hover:bg-white/30 cursor-pointer">
                      <Share2 size={16} />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleFlagClick(); setHasFlagged(true); }}
                      title={hasFlagged ? "Meme flagged" : "Flag"}
                      className={`p-2 rounded-full cursor-pointer transition-colors ${hasFlagged ? "text-red-600 bg-red-200 hover:bg-red-300" : "hover:bg-white/30"}`}
                    >
                      <Flag size={16} fill={hasFlagged ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
            </Link>

            <div className="mt-3 flex-1 flex flex-col gap-2">
                <Link 
                    href={`/community/${meme.slug}`}
                    className="inline-block transition-colors w-fit text-base sm:text-lg font-semibold text-[#1F1147]"
                >
                    {meme.title}
                </Link>

                <div className="text-sm text-gray-500">by {authorName}</div>

                {meme.tags && meme.tags.length > 0 && (
                    <TagDisplay displayedTags={displayedTags} hiddenTags={hiddenTags} />
                )}
            </div>
        </div>
    );
}
