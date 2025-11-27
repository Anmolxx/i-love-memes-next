// src/components/MemePage/MemeCard.tsx
import React from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, Flag, Share2 } from "lucide-react";
import { Meme } from "@/utils/dtos/meme.dto"; 
import TagDisplay from './TagDisplay'; 

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
    
    const userVote = userInteractions.find(
        (i) => i.type === InteractionType.UPVOTE || i.type === InteractionType.DOWNVOTE
    );
    
    const userVoteType: InteractionType.UPVOTE | InteractionType.DOWNVOTE | "NONE" = userVote?.type ?? "NONE";
    const userHasFlagged = userInteractions.some((i) => i.type === InteractionType.FLAG);

    return (
        <div className="bg-gray-200 rounded-2xl shadow-lg p-3 flex flex-col hover:shadow-xl transition-shadow w-full max-w-[700px] mx-auto group">
            <Link 
                href={`/community/${meme.slug}`}
                className="relative w-full h-[500px] overflow-hidden rounded-xl bg-gray-100"
            >
                <img
                    src={meme.file?.path}
                    alt={meme.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </Link>

            <div className="mt-3 flex-1 flex flex-col gap-2">
                <Link 
                    href={`/community/${meme.slug}`}
                    className="text-lg font-semibold text-gray-800 hover:text-pink-600 hover:underline transition-colors w-fit truncate"
                >
                    {meme.title}
                </Link>

                <div className="text-sm text-gray-500">by {authorName}</div>

                {meme.tags && meme.tags.length > 0 && (
                    <TagDisplay displayedTags={displayedTags} hiddenTags={hiddenTags} />
                )}

                <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2">
                        {/* UPVOTE Button */}
                        <button 
                            onClick={() => vote(1)} 
                            className={`flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer transition-colors ${
                                userVoteType === InteractionType.UPVOTE 
                                    ? "bg-green-100 text-green-700 hover:bg-green-200" 
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            <ThumbsUp size={18} /> Up 
                        </button>
                        
                        {/* DOWNVOTE Button */}
                        <button 
                            onClick={() => vote(-1)} 
                            className={`flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer transition-colors ${
                                userVoteType === InteractionType.DOWNVOTE 
                                    ? "bg-red-100 text-red-700 hover:bg-red-200" 
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            <ThumbsDown size={18} /> Down
                        </button>
                        
                        <div className="text-sm font-medium text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                            {meme.interactionSummary?.netScore ?? 0}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => shareMeme(meme)} className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
                            <Share2 size={18} />
                        </button>
                        
                        {/* FLAG Button */}
                        <button 
                            onClick={() => setFlagMemeId(meme.id)} 
                            className={`p-2 rounded-full cursor-pointer transition-colors ${
                                userHasFlagged 
                                    ? "text-red-600 bg-red-200 hover:bg-red-300" 
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            <Flag 
                                size={18} 
                                fill={userHasFlagged ? "currentColor" : "none"} 
                                strokeWidth={userHasFlagged ? 1.5 : 2}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}