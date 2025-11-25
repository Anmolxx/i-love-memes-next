// src/components/MemePage/TagDisplay.tsx
import React from 'react';
import Link from 'next/link';
// import { CirclePlus } from 'lucide-react'; // Not needed anymore
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; 

interface Tag {
    id: string;
    name: string;
    deletedAt: string | null;
}

interface TagDisplayProps {
    displayedTags: Tag[];
    hiddenTags: Tag[];
}

export default function TagDisplay({ displayedTags, hiddenTags }: TagDisplayProps) {
    return (
        <TooltipProvider>
            <div className="flex flex-wrap items-center gap-2 mt-2 relative">
                {/* Displayed tags */}
                {displayedTags.map((tag) => (
                    <Link
                        key={tag.id}
                        href={`/community/?tags=${tag.name}`}
                        className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-md font-medium hover:bg-purple-200 transition"
                    >
                        #{tag.name}
                    </Link>
                ))}

                {/* Hidden tags popover trigger using Tooltip */}
                {hiddenTags.length > 0 && (
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
                                {hiddenTags.map(tag => {
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
                )}
            </div>
        </TooltipProvider>
    );
}