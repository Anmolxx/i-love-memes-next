"use client";

import React, { JSX, useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Flag, Share2, Plus } from "lucide-react";
import { useGetCommunityMemesQuery } from "@/redux/services/community";
import useAuthentication from "@/hooks/use-authentication";
import { Button } from "@/components/ui/button";
import { Noto_Serif } from "@next/font/google";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

interface Meme {
  id: string;
  title: string;
  description: string;
  slug: string;
  file: { id: string; path: string };
  author: { id: string; email: string };
  audience: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  score?: number;
  myVote?: number;
}

const notoSerif = Noto_Serif({
  weight: "600",
  style: "italic",
  subsets: ["latin"],
});

export default function CommunityGallery(): JSX.Element {
  const { data, isLoading, error } = useGetCommunityMemesQuery({ page: 1, per_page: 20 });
  const { user, isLoggedIn, isAdmin } = useAuthentication();

  const [memes, setMemes] = useState<Meme[]>([]);
  const [flagMemeId, setFlagMemeId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState<string>("");
  const [flagComment, setFlagComment] = useState<string>("");

  useEffect(() => {
    const memesData: Meme[] = Array.isArray(data) ? data : data?.items ?? [];
    setMemes(memesData);
  }, [data]);

  const vote = (id: string, newVote: number) => {
    setMemes((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const oldVote = m.myVote ?? 0;
          const newScore = (m.score ?? 0) - oldVote + newVote;
          return { ...m, myVote: newVote, score: newScore };
        }
        return m;
      })
    );
  };

  const shareMeme = async (meme: Meme) => {
    const url = meme.file?.path;
    const title = meme.title;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      toast.error("Share failed");
    }
  };

  const submitFlag = () => {
    console.log("Flagged Meme:", flagMemeId, "Reason:", flagReason, "Comment:", flagComment);
    toast.success("Thanks! The moderation team will review this.");
    resetFlagDialog();
  };

  const resetFlagDialog = () => {
    setFlagMemeId(null);
    setFlagReason("");
    setFlagComment("");
  };

  const topMeme = memes.length > 0 ? memes.reduce((prev, curr) => (curr.score ?? 0) > (prev.score ?? 0) ? curr : prev) : null;

  if (isLoading) return <div className="text-center mt-10">Loading memes...</div>;
  if (error) return <div className="text-center mt-10">Failed to load memes.</div>;

  return (
    <div className="max-w-[110rem] mx-auto p-4 flex flex-col gap-6">
      {/* Full-width heading */}
      <div className="w-full text-center">
        <h2 className="text-2xl font-bold mb-2">Community Gallery</h2>
        <p className="mb-4 text-xl text-[#4A3A7A] mt-5">
          <span
            className={`${notoSerif.className} bg-clip-text text-transparent`}
            style={{ backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)" }}
          >
            Welcome to Ilovememes!{" "}
          </span>
          Explore and share memes with our community. Check out our Shopify store for candles, slims, soaps, and other fun products!
        </p>
      </div>

      {/* Grid + Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6">
        {/* Meme Grid */}
        <div className="flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
            {memes.map((m) => (
              <article key={m.id} className="bg-gray-200 rounded-2xl shadow-lg p-3 flex flex-col hover:shadow-xl transition-shadow">
                {/* Only image wrapped in Link */}
                <Link href={`/community/${m.slug}`} className="relative w-full pb-[100%] overflow-hidden rounded-xl bg-gray-100 mb-3">
                  <img
                    src={m.file?.path}
                    alt={m.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </Link>

                <div className="flex-1 flex flex-col">
                  <div className="text-lg font-semibold text-gray-800 truncate">{m.title}</div>
                  <div className="text-sm text-gray-500">by {m.author?.email ?? "Anonymous"}</div>

                  {/* Vote, share, flag buttons */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        aria-pressed={m.myVote === 1}
                        onClick={() => vote(m.id, m.myVote === 1 ? 0 : 1)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer ${m.myVote === 1 ? "bg-green-50" : ""}`}
                      >
                        <ThumbsUp size={18} />
                        <span className="text-sm">{m.myVote === 1 ? "You" : "Up"}</span>
                      </button>
                      <button
                        aria-pressed={m.myVote === -1}
                        onClick={() => vote(m.id, m.myVote === -1 ? 0 : -1)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer ${m.myVote === -1 ? "bg-red-50" : ""}`}
                      >
                        <ThumbsDown size={18} />
                        <span className="text-sm">Down</span>
                      </button>
                      <div className="text-sm font-medium text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                        {m.score ?? 0}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => shareMeme(m)} title="Share" className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
                        <Share2 size={18} />
                      </button>
                      <button onClick={() => setFlagMemeId(m.id)} title="Flag" className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
                        <Flag size={18} />
                      </button>

                      <Dialog open={flagMemeId === m.id} onOpenChange={resetFlagDialog}>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Flag Meme</DialogTitle>
                            <DialogDescription>Reason for flagging this meme</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Select value={flagReason} onValueChange={setFlagReason}>
                              <SelectTrigger className="w-full cursor-pointer">
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="nsfw">NSFW: Content contains nudity.</SelectItem>
                                <SelectItem value="nsfl">NSFL: Highly disturbing.</SelectItem>
                                <SelectItem value="tw">Trigger Warning.</SelectItem>
                                <SelectItem value="red_flag">Red Flag Emoji (🚩).</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              className="w-full"
                              placeholder="Additional comments (optional)"
                              value={flagComment}
                              onChange={(e) => setFlagComment(e.target.value)}
                            />
                            <DialogFooter className="flex justify-end gap-2 cursor-pointer">
                              <Button variant="outline" onClick={resetFlagDialog}>
                                Cancel
                              </Button>
                              <Button onClick={submitFlag} disabled={!flagReason}>
                                Submit
                              </Button>
                            </DialogFooter>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6 pt-4">

          <div className="bg-gray-100 p-4 rounded-2xl shadow">
            {isLoggedIn ? (
              <div className="flex flex-col gap-3 text-center">
                <p className="text-gray-700 font-medium">Create your own meme!</p>
                  <Link href="/meme">
                  <Button variant="default" className="w-full cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" /> Create Meme
                  </Button>
                  </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-center">
                <p className="text-gray-700 font-medium">Login to create memes.</p>
                <Link href="/auth/login">
                <Button variant="default" className="w-full cursor-pointer">
                  Login
                </Button>
                </Link>
              </div>
            )}
          </div>

          {topMeme && (
            <div className="bg-gray-100 p-4 rounded-2xl shadow">
              <h3 className="text-lg font-semibold mb-2">Top Meme</h3>
              <img src={topMeme.file?.path} alt={topMeme.title} className="w-full rounded-xl mb-2" />
              <p className="text-gray-700 text-sm font-medium mb-2">{topMeme.title}</p>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    aria-pressed={topMeme.myVote === 1}
                    onClick={() => vote(topMeme.id, topMeme.myVote === 1 ? 0 : 1)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer ${topMeme.myVote === 1 ? "bg-green-50" : ""}`}
                  >
                    <ThumbsUp size={18} />
                  </button>
                  <button
                    aria-pressed={topMeme.myVote === -1}
                    onClick={() => vote(topMeme.id, topMeme.myVote === -1 ? 0 : -1)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer ${topMeme.myVote === -1 ? "bg-red-50" : ""}`}
                  >
                    <ThumbsDown size={18} />
                  </button>
                  <div className="text-sm font-medium text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                    {topMeme.score ?? 0}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
