"use client";

import React, { JSX, useState, useEffect, useCallback } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ThumbsUp, ThumbsDown, Flag, Share2, Plus } from "lucide-react";
import { useGetMemesQuery } from "@/redux/services/meme";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { CommunityPagination } from "@/components/data-table/data-table-community-gallery-pagination";
import {
  usePostInteractionMutation,
  useDeleteInteractionMutation,
  useGetInteractionSummaryQuery,
} from "@/redux/services/interaction";
import { InteractionType } from "@/utils/interaction.dto";
import { InteractionSummary } from "@/types/meme-types";

interface RawMemeData {
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
}

type VoteStatus = InteractionType.UPVOTE | InteractionType.DOWNVOTE | "NONE";

interface Meme extends RawMemeData {
  netScore: number;
  userVoteType: VoteStatus;
  isVoting: boolean;
  userHasFlagged: boolean;
}

const notoSerif = Noto_Serif({
  weight: "600",
  style: "italic",
  subsets: ["latin"],
});

interface MemeSummaryFetcherProps {
  memeId: string;
  userId: string | undefined;
  updateMemeState: (memeId: string, summary: InteractionSummary) => void;
}

function MemeSummaryFetcher({ memeId, userId, updateMemeState }: MemeSummaryFetcherProps) {
  const { data: summary } = useGetInteractionSummaryQuery(
    { memeId, userId: userId ?? "" },
    { skip: !userId }
  );

  useEffect(() => {
    if (summary) {
      updateMemeState(memeId, summary);
    }
  }, [summary, memeId, updateMemeState]);

  return null;
}

function CreateMemeCard({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
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
  );
}

export default function CommunityGallery(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get("page") ?? "1");
  const per_page = parseInt(searchParams.get("per_page") ?? "4");
  const search = searchParams.get("search") ?? "";

  const [searchQuery, setSearchQuery] = useState(search);
  const { data, isLoading, error, isFetching } = useGetMemesQuery({
    page,
    per_page,
    search,
  });
  const { user, isLoggedIn } = useAuthentication();

  const [postInteraction, { isLoading: isPosting }] = usePostInteractionMutation();
  const [deleteInteraction, { isLoading: isDeleting }] = useDeleteInteractionMutation();

  const [flagMemeId, setFlagMemeId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState<string>("");
  const [flagComment, setFlagComment] = useState<string>("");
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  const [memes, setMemes] = useState<Meme[]>([]);

  useEffect(() => {
    if (data) {
      const rawMemes: RawMemeData[] = Array.isArray(data)
        ? data
        : data?.items ?? [];
      setMemes(
        rawMemes.map((m: RawMemeData) => ({
          ...m,
          netScore: m.score ?? 0,
          userVoteType: "NONE",
          isVoting: false,
          userHasFlagged: false,
        }))
      );
    }
  }, [data]);
  
  const updateMemeState = useCallback((memeId: string, summary: InteractionSummary) => {
    setMemes(prevMemes => 
        prevMemes.map(meme => {
            if (meme.id === memeId) {
                const userVoteType: VoteStatus = summary.userInteraction?.type === InteractionType.UPVOTE
                    ? InteractionType.UPVOTE
                    : summary.userInteraction?.type === InteractionType.DOWNVOTE
                    ? InteractionType.DOWNVOTE
                    : "NONE";

                const userHasFlagged = summary.flagCount > 0;

                return {
                    ...meme,
                    netScore: summary.netScore,
                    userVoteType,
                    userHasFlagged,
                };
            }
            return meme;
        })
    );
  }, []);

  const topMeme = memes.reduce((top, current) => {
    if (!top) return current; // Initialize top with the first meme
    return current.netScore > top.netScore ? current : top; // Return the meme with the higher netScore
  }, null as Meme | null);

  const shareMeme = (meme: Meme) => {
    const shareData = {
      title: meme.title,
      text: `Check out this meme: ${meme.title} by ${meme.author?.email ?? "Anonymous"}`,
      url: `${window.location.origin}/community/${meme.slug}`,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(shareData.url).then(() => toast.info("Link copied to clipboard!")).catch(() => toast.error("Failed to copy link."));
        }
      });
    } else {
      navigator.clipboard.writeText(shareData.url).then(() => toast.info("Link copied to clipboard!")).catch(() => toast.error("Failed to copy link."));
    }
  };

  const handleVote = useCallback(
    async (memeId: string, targetVoteType: InteractionType.UPVOTE | InteractionType.DOWNVOTE) => {
      if (!isLoggedIn) return toast.error("Please login to cast a vote.");
      if (!user?.id) return toast.error("User ID is missing.");

      setMemes((prevMemes) =>
        prevMemes.map((m) => (m.id === memeId ? { ...m, isVoting: true } : m))
      );

      const memeToUpdate = memes.find((m) => m.id === memeId);
      if (!memeToUpdate) return;
      const userVoteType = memeToUpdate.userVoteType;

      try {
        let newNetScore = memeToUpdate.netScore;
        let newUserVoteType: VoteStatus = targetVoteType;

        if (userVoteType === targetVoteType) {
          await deleteInteraction({ memeId, type: userVoteType as InteractionType.UPVOTE | InteractionType.DOWNVOTE });
          newNetScore += targetVoteType === InteractionType.UPVOTE ? -1 : 1;
          newUserVoteType = "NONE";
          toast.success("Vote removed!");
        } else if (userVoteType !== "NONE") {
          await deleteInteraction({ memeId, type: userVoteType as InteractionType.UPVOTE | InteractionType.DOWNVOTE });
          await postInteraction({ memeId, type: targetVoteType });
          newNetScore +=
            (targetVoteType === InteractionType.UPVOTE ? 1 : -1) +
            (userVoteType === InteractionType.UPVOTE ? -1 : 1);
          newUserVoteType = targetVoteType;
          toast.success(`Switched to ${targetVoteType}!`);
        } else {
          await postInteraction({ memeId, type: targetVoteType });
          newNetScore += targetVoteType === InteractionType.UPVOTE ? 1 : -1;
          newUserVoteType = targetVoteType;
          toast.success(
            `${targetVoteType === InteractionType.UPVOTE ? "Upvoted" : "Downvoted"}!`
          );
        }

        setMemes((prevMemes) =>
          prevMemes.map((m) =>
            m.id === memeId
              ? {
                  ...m,
                  netScore: newNetScore,
                  userVoteType: newUserVoteType,
                  isVoting: false,
                }
              : m
          )
        );
      } catch (err) {
        toast.error("Failed to update vote.");
        setMemes((prevMemes) =>
          prevMemes.map((m) => (m.id === memeId ? { ...m, isVoting: false } : m))
        );
      }
    },
    [isLoggedIn, user?.id, memes, postInteraction, deleteInteraction]
  );
  
  const submitFlag = useCallback(async () => {
    if (!flagMemeId || !flagReason || isSubmittingFlag) return;
    setIsSubmittingFlag(true);

    try {
      await postInteraction({
        memeId: flagMemeId,
        type: InteractionType.FLAG,
        reason: flagReason,
        note: flagComment || undefined,
      });
      
      setMemes(prevMemes => prevMemes.map(m => 
          m.id === flagMemeId ? { ...m, userHasFlagged: true } : m
      ));

      toast.success("Meme flagged successfully!");
      resetFlagDialog();
    } catch (err) {
      toast.error("Failed to submit flag.");
    } finally {
      setIsSubmittingFlag(false);
    }
  }, [flagMemeId, flagReason, flagComment, isSubmittingFlag, postInteraction]);

  const resetFlagDialog = () => {
    setFlagMemeId(null);
    setFlagReason("");
    setFlagComment("");
  };

  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim() === "") newParams.delete("search");
    else {
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
      {memes.map((meme) => (
        <MemeSummaryFetcher
          key={`summary-${meme.id}`}
          memeId={meme.id}
          userId={user?.id}
          updateMemeState={updateMemeState}
        />
      ))}
      
      <div className="relative">
        <nav className="w-full sticky top-0 z-50 bg-white/70 backdrop-blur">
          <div
            className="max-w-6xl px-4 py-2 flex items-center gap-6 mx-auto"
            style={{ transform: "translateX(100px)" }}
          >
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
                disabled={isFetching}
              />
            </div>
            <Button className="ml-2" onClick={handleSearch} disabled={isFetching}>
              Search
            </Button>
          </div>
        </nav>
      </div>

      <div className="max-w-[110rem] mx-auto p-4 flex flex-col gap-6">
        <div className="w-full text-center">
          <p className="mb-4 text-xl text-[#4A3A7A]">
            <span
              className={`${notoSerif.className} bg-clip-text text-transparent`}
              style={{
                backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
              }}
            >
              Welcome to Ilovememes!{" "}
            </span>
            Explore and share memes with our community. Check out our Shopify store for candles, slims,
            soaps, and other fun products!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6 h-[calc(100vh-200px)]">
          <div className="overflow-y-auto pr-2 hide-scrollbar">
            {memes.length === 0 && !isLoading ? (
              <div className="text-center text-gray-500 mt-10">
                <p className="text-xl mb-2">
                  Oops! We couldn’t find any memes for &quot;{search}&quot; 😅
                </p>
                <p className="text-sm">
                  Looks like the internet has failed you. Try another search or create your own meme!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {memes.map((meme) => (
                  <article
                    key={meme.id}
                    className="bg-gray-200 rounded-2xl shadow-lg p-3 flex flex-col hover:shadow-xl transition-shadow"
                  >
                    <Link
                      href={`/community/${meme.slug}`}
                      className="relative w-full pb-[100%] overflow-hidden rounded-xl bg-gray-100 mb-3"
                    >
                      <img
                        src={meme.file?.path}
                        alt={meme.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    </Link>

                    <div className="flex-1 flex flex-col">
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

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            aria-pressed={meme.userVoteType === InteractionType.UPVOTE}
                            onClick={() => handleVote(meme.id, InteractionType.UPVOTE)}
                            disabled={meme.isVoting || isPosting || isDeleting}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50 ${
                              meme.userVoteType === InteractionType.UPVOTE
                                ? "bg-green-100 text-green-700"
                                : ""
                            }`}
                          >
                            <ThumbsUp size={18} />
                            <span className="text-sm">
                              {meme.userVoteType === InteractionType.UPVOTE ? "You" : "Up"}
                            </span>
                          </button>

                          <button
                            aria-pressed={meme.userVoteType === InteractionType.DOWNVOTE}
                            onClick={() => handleVote(meme.id, InteractionType.DOWNVOTE)}
                            disabled={meme.isVoting || isPosting || isDeleting}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50 ${
                              meme.userVoteType === InteractionType.DOWNVOTE
                                ? "bg-red-100 text-red-700"
                                : ""
                            }`}
                          >
                            <ThumbsDown size={18} />
                            <span className="text-sm">Down</span>
                          </button>

                          <div className="text-sm font-medium text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                            {meme.netScore}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => shareMeme(meme)}
                            title="Share"
                            className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                          >
                            <Share2 size={18} />
                          </button>
                          
                          <button
                            onClick={() => setFlagMemeId(meme.id)}
                            title={meme.userHasFlagged ? "Meme flagged" : "Flag"}
                            className={`p-2 rounded-full cursor-pointer transition-colors ${
                                meme.userHasFlagged 
                                    ? 'text-red-600 bg-red-200 hover:bg-red-300' 
                                    : 'hover:bg-gray-100'
                            }`}
                          >
                            <Flag 
                                size={18} 
                                fill={meme.userHasFlagged ? 'currentColor' : 'none'} 
                            />
                          </button>
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
            <CreateMemeCard isLoggedIn={isLoggedIn} />

            {topMeme && (
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
            )}
          </aside>
        </div>
      </div>

      <Dialog open={!!flagMemeId} onOpenChange={resetFlagDialog}>
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
                {isSubmittingFlag ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}