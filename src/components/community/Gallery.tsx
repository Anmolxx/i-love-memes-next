"use client";

import React, { JSX, useState, useEffect, useCallback } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { CommunityPagination } from "@/components/data-table/data-table-community-gallery-pagination"
import {
  usePostInteractionMutation,
  useDeleteInteractionMutation,
} from "@/redux/services/interaction"; 
import { VoteType } from "@/utils/meme-types"; 

interface RawMemeData {
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
  netScore: number;
  userVoteType: 'UPVOTE' | 'DOWNVOTE' | 'NONE';
  isVoting?: boolean;
}

const notoSerif = Noto_Serif({
  weight: "600",
  style: "italic",
  subsets: ["latin"],
});

export default function CommunityGallery(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = parseInt(searchParams.get("page") ?? "1");
  const per_page = parseInt(searchParams.get("per_page") ?? "4");
  const search = searchParams.get("search") ?? "";

  const [searchQuery, setSearchQuery] = useState(search);

  const { data, isLoading, error } = useGetCommunityMemesQuery({ page, per_page, search });
  const { user, isLoggedIn, isAdmin } = useAuthentication();

  const [postInteraction, { isLoading: isPosting }] = usePostInteractionMutation();
  const [deleteInteraction, { isLoading: isDeleting }] = useDeleteInteractionMutation();

  const [memes, setMemes] = useState<Meme[]>([]);
  const [flagMemeId, setFlagMemeId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState<string>("");
  const [flagComment, setFlagComment] = useState<string>("");
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  useEffect(() => {
    const memesData: Meme[] = (Array.isArray(data) ? data : data?.items ?? []).map((m: RawMemeData) => ({
      ...m,
      netScore: m.score ?? 0,
      userVoteType: m.myVote === 1 ? 'UPVOTE' : m.myVote === -1 ? 'DOWNVOTE' : 'NONE',
      isVoting: false,
    }));
    setMemes(memesData);
  }, [data]);

  useEffect(() => {
      if (!searchParams.get("page")) {
        const query = new URLSearchParams(searchParams.toString());
        query.set("page", "1");
        router.replace(`/community?${query.toString()}`);
      }
    }, [searchParams, router]);

  useEffect(() => {
    if (searchQuery.trim() === "" && searchParams.get("search")) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("search"); 
      router.push(`/community?${newParams.toString()}`);
    }
  }, [searchQuery, searchParams, router]);

  const handleVote = useCallback(async (memeId: string, targetVoteType: 'UPVOTE' | 'DOWNVOTE') => {
      if (!isLoggedIn) {
          toast.error("Please login to cast a vote.");
          return;
      }
      if (!user?.id) {
          toast.error("User ID is missing. Cannot submit vote.");
          return;
      }
      
      const meme = memes.find(m => m.id === memeId);
      if (!meme || meme.isVoting) return;

      setMemes(prev => prev.map(m => m.id === memeId ? { ...m, isVoting: true } : m));

      try {
          const currentVoteType = meme.userVoteType;
          let newNetScore = meme.netScore;
          let finalUserVoteType: 'UPVOTE' | 'DOWNVOTE' | 'NONE' = 'NONE';
          
          if (currentVoteType === targetVoteType) {
              await deleteInteraction({ memeId, type: currentVoteType }); 
              
              newNetScore += (currentVoteType === 'DOWNVOTE' ? 1 : -1); 
              finalUserVoteType = 'NONE';
              toast.success(`Vote removed!`);

          } else if (currentVoteType !== 'NONE') {
              await deleteInteraction({ memeId, type: currentVoteType }); 
              const typeToPost: VoteType = targetVoteType;
              await postInteraction({ memeId, type: typeToPost }); 
              newNetScore += (currentVoteType === 'DOWNVOTE' ? 1 : -1); 
              newNetScore += (targetVoteType === 'UPVOTE' ? 1 : -1); 

              finalUserVoteType = targetVoteType;
              toast.success(`Switched to ${targetVoteType}!`);

          } else {
              const typeToPost: VoteType = targetVoteType;
              await postInteraction({ memeId, type: typeToPost }); 
              
              newNetScore += (targetVoteType === 'UPVOTE' ? 1 : -1);
              finalUserVoteType = targetVoteType;
              toast.success(`${targetVoteType === 'UPVOTE' ? 'Upvoted' : 'Downvoted'}!`);
          }

          setMemes(prev => prev.map(m => 
              m.id === memeId ? { 
                  ...m, 
                  netScore: newNetScore,
                  userVoteType: finalUserVoteType,
                  isVoting: false, 
              } : m
          ));

      } catch (err) {
          toast.error("Failed to update vote. Please try again.");
          console.error("Vote API error:", err);
          setMemes(prev => prev.map(m => m.id === memeId ? { ...m, isVoting: false } : m));
      }
  }, [isLoggedIn, user, memes, postInteraction, deleteInteraction]);


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

  const submitFlag = useCallback(async () => {
    if (!flagMemeId || !flagReason || isSubmittingFlag) return;
    if (!isLoggedIn) {
        toast.error("You must be logged in to flag content.");
        return;
    }

    setIsSubmittingFlag(true);

    try {
        const flagType: VoteType = flagReason === "red_flag" ? 'FLAG' : 'REPORT';
        const reasonDetail = flagReason !== "red_flag" ? flagReason : undefined;
        
        await postInteraction({ 
            memeId: flagMemeId, 
            type: flagType, 
            reason: reasonDetail,
            note: flagComment,    
        });

        toast.success("Meme flagged. Thank you for reporting!");
        resetFlagDialog();

    } catch (err) {
        toast.error("Failed to submit flag. Please try again.");
        console.error("Flag API error:", err);
    } finally {
        setIsSubmittingFlag(false);
    }
  }, [flagMemeId, flagReason, flagComment, isSubmittingFlag, isLoggedIn, postInteraction]);

  const resetFlagDialog = () => {
    setFlagMemeId(null);
    setFlagReason("");
    setFlagComment("");
  };

  const topMeme = memes.length > 0 ? memes.reduce((prev, curr) => (curr.netScore ?? 0) > (prev.netScore ?? 0) ? curr : prev) : null;

  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim() === "") { 
      newParams.delete("search");
    } else {
      newParams.set("search", searchQuery);
      newParams.set("page", "1"); 
    }
    router.push(`/community?${newParams.toString()}`);
  };
  

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", newPage.toString());
    router.push(`/community?${newParams.toString()}`);
  };

  if (isLoading) return <div className="text-center mt-10">Loading memes...</div>;
  if (error) return <div className="text-center mt-10">Failed to load memes.</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="relative">
        <nav className="w-full sticky top-0 z-50 bg-white/70 backdrop-blur">
          <div className="max-w-6xl px-4 py-2 flex items-center gap-6 mx-auto" style={{ transform: "translateX(100px)" }}>
            <Link href="/">
              <div className="relative h-15 w-30 flex-shrink-0">
                <NextImage
                  src="/brand/ilovememes-logo.png"
                  alt="I Love Memes"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <div className="flex-1 max-w-[640px]">
              <Input
                placeholder="Search Memes"
                value={searchQuery}
                className="h-10"
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button className="ml-2" onClick={handleSearch}>Search</Button>
          </div>
        </nav>
      </div>

      <div className="max-w-[110rem] mx-auto p-4 flex flex-col gap-6">
        <div className="w-full text-center">
          <p className="mb-4 text-xl text-[#4A3A7A]">
            <span
              className={`${notoSerif.className} bg-clip-text text-transparent`}
              style={{ backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)" }}
            >
              Welcome to Ilovememes!{" "}
            </span>
            Explore and share memes with our community. Check out our Shopify store for candles, slims, soaps, and other fun products!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6 h-[calc(100vh-150px)]">
          <div className="overflow-y-auto pr-2">
            {memes.length === 0 && !isLoading ? (
                <div className="text-center text-gray-500 mt-10">
                  <p className="text-xl mb-2">Oops! We couldn’t find any memes for &quot;{searchQuery}&quot; 😅</p>
                  <p className="text-sm">Looks like the internet has failed you. Try another search or create your own meme!</p>
                </div>
              ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {memes.map((m) => (
                <article key={m.id} className="bg-gray-200 rounded-2xl shadow-lg p-3 flex flex-col hover:shadow-xl transition-shadow">
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

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          aria-pressed={m.userVoteType === 'UPVOTE'}
                          onClick={() => handleVote(m.id, 'UPVOTE')}
                          disabled={m.isVoting || isPosting || isDeleting}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50 ${m.userVoteType === 'UPVOTE' ? "bg-green-100 text-green-700" : ""}`}
                        >
                          <ThumbsUp size={18} />
                          <span className="text-sm">{m.userVoteType === 'UPVOTE' ? "You" : "Up"}</span>
                        </button>
                        <button
                          aria-pressed={m.userVoteType === 'DOWNVOTE'}
                          onClick={() => handleVote(m.id, 'DOWNVOTE')}
                          disabled={m.isVoting || isPosting || isDeleting}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50 ${m.userVoteType === 'DOWNVOTE' ? "bg-red-100 text-red-700" : ""}`}
                        >
                          <ThumbsDown size={18} />
                          <span className="text-sm">Down</span>
                        </button>
                        <div className="text-sm font-medium text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                          {m.netScore}
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
                                <Button onClick={submitFlag} disabled={!flagReason || isSubmittingFlag}>
                                  {isSubmittingFlag ? 'Submitting...' : 'Submit'}
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
            )}

            {memes.length > 0 && (
            <div className="mt-4">
              <CommunityPagination
                page={page}
                pageCount={data?.meta?.totalPages ?? 0}
                onPageChange={handlePageChange}
              />
            </div>
            )}
          </div>

          <aside className="flex flex-col gap-6 pt-4 sticky top-0 h-[calc(100vh-200px)] overflow-y-auto">
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
                    <Button variant="default" className="w-full cursor-pointer"> Login </Button> 
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
                      aria-pressed={topMeme.userVoteType === 'UPVOTE'}
                      onClick={() => handleVote(topMeme.id, 'UPVOTE')}
                      disabled={topMeme.isVoting || isPosting || isDeleting}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50 ${topMeme.userVoteType === 'UPVOTE' ? "bg-green-100" : ""}`}
                    >
                      <ThumbsUp size={18} />
                    </button>
                    <button
                      aria-pressed={topMeme.userVoteType === 'DOWNVOTE'}
                      onClick={() => handleVote(topMeme.id, 'DOWNVOTE')}
                      disabled={topMeme.isVoting || isPosting || isDeleting}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50 ${topMeme.userVoteType === 'DOWNVOTE' ? "bg-red-100" : ""}`}
                    >
                      <ThumbsDown size={18} />
                    </button>
                    <div className="text-sm font-medium text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                      {topMeme.netScore}
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}