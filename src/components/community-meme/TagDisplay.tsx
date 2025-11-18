// src/components/MemePage/TagDisplay.tsx
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Tag { // Assuming Tag structure
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
        <div className="flex flex-wrap items-center gap-2 mt-2">
            {displayedTags.map((tag) => (
                <span
                    key={tag.id}
                    className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium"
                >
                    #{tag.name}
                </span>
            ))}

            {hiddenTags.length > 0 && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-300 transition">
                                +{hiddenTags.length} more
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {hiddenTags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="text-xs bg-purple-50 text-purple-800 px-2 py-1 rounded-full font-medium"
                                    >
                                        #{tag.name}
                                    </span>
                                ))}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
}