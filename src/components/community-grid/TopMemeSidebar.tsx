"use client";
import Link from "next/link";

export function TopMemeSidebar({ topMeme }: { topMeme: any }) {
  if (!topMeme) return null;

  return (
    <div className=" p-3 rounded-2xl shadow bg-[rgb(249,236,254)] border-2 border-[#F95FFF]" >
      <h3 className="text-[20px] sm:text-lg font-semibold text-dark mb-3">Top Meme</h3>
      <Link href={`/community/${topMeme.slug}`}>
        <img
          src={topMeme.file?.path}
          alt={topMeme.title}
          className="w-full rounded-xl mb-2 object-contain aspect-square"
        />
      </Link>
      <p className="text-gray-700 text-sm font-medium mb-2">{topMeme.title}</p>
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-gray-700 px-3 py-1 rounded-full border border-gray-700">
          Score: {topMeme.netScore}
        </div>
      </div>
    </div>
  );
}
