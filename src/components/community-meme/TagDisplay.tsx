import React from 'react';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Tag {
  id: string;
  slug: string;
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

        {displayedTags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/community/?tags=${tag.name}`}
            target="_blank"
            className="text-sm bg-purple-100 text-purple-800 px-6 py-1 rounded-xl font-medium hover:bg-purple-200 transition"
          >
            #{tag.name}
          </Link>
        ))}

        {hiddenTags.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md font-medium cursor-pointer hover:bg-gray-300 transition"
              >
                +{hiddenTags.length} more
              </span>
            </TooltipTrigger>

            <TooltipContent
              side="top"
              className="bg-white text-black shadow-lg p-2 rounded-md border border-gray-200"
            >
              <div className="flex flex-wrap gap-2 max-w-[200px]">
                {hiddenTags.map((tag) => {
                  const key = `${tag.slug}`;
                  const hasName = tag.name && tag.name.length > 0;

                  return hasName ? (
                    <Link
                      key={key}
                      href={`/community/?tags=${tag.name}`}
                      target="_blank"
                      className="hover:opacity-80 transition-opacity py-0.5"
                    >
                      <span className="text-xs px-2 py-1 rounded-lg font-medium border border-transparent bg-gray-200 text-gray-800">
                        #{tag.name}
                      </span>
                    </Link>
                  ) : (
                    <span
                      key={key}
                      className="text-xs px-2 py-1 rounded-lg font-medium border border-transparent bg-gray-200 text-gray-800"
                    >
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
