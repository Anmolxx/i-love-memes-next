"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { ThumbsUp, ThumbsDown, Flag, Share2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useGetMemeBySlugOrIdQuery } from "@/redux/services/meme";
import useAuthentication from "@/hooks/use-authentication";
import { Navbar } from "@/components/ui/extension/navbar-internal";
import AppSidebar from "@/components/organisms/app-sidebar-internal";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Footer } from "@/sections/Footer";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Meme {
  id: string;
  title: string;
  description: string;
  slug: string;
  file: { id: string; path: string };
  author: { 
    id: string; 
    email: string;
    firstName?: string;
    lastName?: string;
  };
  audience: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  score?: number;
  myVote?: number;
  tags?: Tag[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export default function MemePage() {
  const { slug } = useParams();
  const { data, isLoading, error } = useGetMemeBySlugOrIdQuery(slug as string);
  const { user, isLoggedIn } = useAuthentication();

  const meme: Meme | null = data?.data ?? null;

  const [flagMemeId, setFlagMemeId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState<string>("");
  const [flagComment, setFlagComment] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (error || !meme) return <div className="text-center mt-10">Meme not found</div>;

  const vote = (newVote: number) => {
    toast.success(`Vote: ${newVote === 1 ? "Upvoted" : newVote === -1 ? "Downvoted" : "Cleared"}`);
  };

  const shareMeme = async () => {
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
    toast.success("Thanks! The moderation team will review this.");
    resetFlagDialog();
  };

  const resetFlagDialog = () => {
    setFlagMemeId(null);
    setFlagReason("");
    setFlagComment("");
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `${Date.now()}`,
      author: user?.email ?? "Anonymous",
      content: newComment,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [comment, ...prev]);
    setNewComment("");
    toast.success("Comment added!");
  };

  const displayedTags = meme.tags?.slice(0, 3) ?? [];
  const hiddenTags = meme.tags?.slice(3) ?? [];

  return (
    <SidebarProvider>
      <div className="group/sidebar-wrapper flex min-h-svh w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 bg-gray-50">
          <Navbar />

          <div className="max-w-6xl mx-auto p-4 flex flex-col md:flex-row gap-6 mt-5">
            {/* Left Column - Meme Card + Comments */}
            <div className="flex-1 flex flex-col gap-4 md:flex-[3] min-w-0">
              {/* Meme Card */}
              <div className="bg-gray-200 rounded-2xl shadow-lg p-3 flex flex-col hover:shadow-xl transition-shadow w-full max-w-[700px] mx-auto">
                <div className="relative w-full h-[500px] overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={meme.file?.path}
                    alt={meme.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                <div className="mt-3 flex-1 flex flex-col gap-2">
                  <div className="text-lg font-semibold text-gray-800 truncate">
                    {meme.title}
                  </div>
                 <div className="text-sm text-gray-500">
                   by{" "}
                   {meme.author
                     ? (
                         (meme.author.firstName || meme.author.lastName)
                           ? `${meme.author.firstName ?? ""} ${meme.author.lastName ?? ""}`.trim()
                           : meme.author.email
                       ) || "Anonymous"
                     : "Anonymous"}
                 </div>

                  {/* Tags Section */}
                  {meme.tags && meme.tags.length > 0 && (
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
                  )}

                  {/* Vote, Share, Flag */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => vote(1)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer"
                      >
                        <ThumbsUp size={18} /> Up
                      </button>
                      <button
                        onClick={() => vote(-1)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer"
                      >
                        <ThumbsDown size={18} /> Down
                      </button>
                      <div className="text-sm font-medium text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                        {meme.score ?? 0}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={shareMeme}
                        className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                      >
                        <Share2 size={18} />
                      </button>
                      <button
                        onClick={() => setFlagMemeId(meme.id)}
                        className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                      >
                        <Flag size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="flex flex-col gap-3 bg-white p-3 rounded-xl shadow-md border border-gray-200 md:w-[700px] overflow-y-auto mx-auto">
                <h3 className="font-semibold text-lg">Comments</h3>
                {isLoggedIn && (
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add a comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button onClick={addComment} className="cursor-pointer">
                      Post
                    </Button>
                  </div>
                )}
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-sm">No comments yet</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-2 bg-gray-100 rounded-xl">
                      <p className="text-sm font-medium">{c.author}</p>
                      <p className="text-sm">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column - Caption & Description */}
            <div className="flex flex-col gap-4 w-full md:flex-[1]">
              <Link href="/meme">
                <div
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium text-white shadow-sm cursor-pointer"
                  style={{
                    background: "linear-gradient(90deg,#CD01BA,#E20317)",
                    boxShadow:
                      "0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)",
                  }}
                >
                  Caption this Meme
                </div>
              </Link>

              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 text-sm">
                <div className="flex flex-col gap-1">
                  <p className="text-gray-700 text-base">
                    Created with{" "}
                    <Link
                      href="/meme"
                      className="text-[#4b087e] font-semibold hover:underline cursor-pointer"
                    >
                      ILoveMemes Meme Generator
                    </Link>
                  </p>
                  <span className="font-semibold text-gray-800">
                    IMAGE DESCRIPTION:
                  </span>
                  <p className="text-gray-700 text-base">{meme.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- FLAG DIALOG BOX ---------- */}
          <Dialog open={flagMemeId === meme.id} onOpenChange={resetFlagDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Flag Meme</DialogTitle>
                <DialogDescription>
                  Reason for flagging this meme
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={flagReason} onValueChange={setFlagReason}>
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nsfw">
                      NSFW: Content contains nudity.
                    </SelectItem>
                    <SelectItem value="nsfl">
                      NSFL: Highly disturbing.
                    </SelectItem>
                    <SelectItem value="tw">Trigger Warning.</SelectItem>
                    <SelectItem value="red_flag">
                      Red Flag Emoji (🚩).
                    </SelectItem>
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

          <div className="mt-20">
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
