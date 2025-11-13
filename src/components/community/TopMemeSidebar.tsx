"use client";
import Link from "next/link";

export function TopMemeSidebar({ topMeme }: { topMeme: any }) {
  if (!topMeme) return null;

  return (
    <div className="bg-gray-100 p-4 rounded-2xl shadow">
      <h3 className="text-lg font-semibold mb-2">Top Meme</h3>
      <Link href={`/community/${topMeme.slug}`}>
        <img
          src={topMeme.file?.path}
          alt={topMeme.title}
          className="w-full rounded-xl mb-2 object-cover aspect-square"
        />
      </Link>
      <p className="text-gray-700 text-sm font-medium mb-2">{topMeme.title}</p>
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-gray-700 px-3 py-1 rounded-full border border-gray-200">
          Score: {topMeme.netScore}
        </div>
      </div>
    </div>
  );
}
