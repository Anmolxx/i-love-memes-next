"use client";

import React, { JSX, useState, useEffect, useCallback } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ThumbsUp, ThumbsDown, Flag, Share2, Plus } from "lucide-react";
import { useGetCommunityMemesQuery } from "@/redux/services/meme";
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
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { CommunityPagination } from "@/components/data-table/data-table-community-gallery-pagination";
import {
  usePostInteractionMutation,
  useDeleteInteractionMutation,
  useGetInteractionSummaryQuery,
} from "@/redux/services/interaction";
import { InteractionType } from "@/utils/interaction.dto";
// import { useAuthModal } from "@/hooks/use-auth-modal";

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
}

type VoteStatus = InteractionType.UPVOTE | InteractionType.DOWNVOTE | "NONE";

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
  userVoteType: VoteStatus;
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
  // const { openModal } = useAuthModal();
  const page = parseInt(searchParams.get("page") ?? "1");
  const per_page = parseInt(searchParams.get("per_page") ?? "4");
  const search = searchParams.get("search") ?? "";

  const [searchQuery, setSearchQuery] = useState(search);
  const { data, isLoading, error } = useGetCommunityMemesQuery({ page, per_page, search });
  const { user, isLoggedIn } = useAuthentication();

  const [postInteraction] = usePostInteractionMutation();
  const [deleteInteraction] = useDeleteInteractionMutation();

  const [flagMemeId, setFlagMemeId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState<string>("");
  const [flagComment, setFlagComment] = useState<string>("");
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  const memes: Meme[] = (Array.isArray(data) ? data : data?.items ?? []).map((m: RawMemeData) => ({
    ...m,
    netScore: m.score ?? 0,
    userVoteType: "NONE",
    isVoting: false,
  }));

  const submitFlag = useCallback(async () => {
    if (!flagMemeId || !flagReason || isSubmittingFlag) return;
    setIsSubmittingFlag(true);

    try {
      await postInteraction({ memeId: flagMemeId, type: InteractionType.FLAG, reason: flagReason, note: flagComment || undefined });
      toast.success("Meme flagged successfully!");
      resetFlagDialog();
    } catch (err) {
      toast.error("Failed to submit flag.");
      console.error(err);
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
      <div className="relative">
        <nav className="w-full sticky top-0 z-50 bg-white/70 backdrop-blur">
          <div className="max-w-6xl px-4 py-2 flex items-center gap-6 mx-auto" style={{ transform: "translateX(100px)" }}>
            <Link href="/">
              <div className="relative h-15 w-30 flex-shrink-0">
                <NextImage src="/brand/ilovememes-logo.png" alt="I Love Memes" fill className="object-contain" priority />
              </div>
            </Link>
            <div className="flex-1 max-w-[640px]">
              <Input
                placeholder="Search Memes"
                value={searchQuery}
                className="h-10"
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button className="ml-2" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </nav>
      </div>

      <div className="max-w-[110rem] mx-auto p-4 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6 h-[calc(100vh-200px)]">
          <div className="overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {memes.map(meme => (
                <MemeCard
                  key={meme.id}
                  meme={meme}
                  user={user}
                  postInteraction={postInteraction}
                  deleteInteraction={deleteInteraction}
                  setFlagMemeId={setFlagMemeId}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
            <CommunityPagination page={page} pageCount={data?.meta?.totalPages ?? 0} onPageChange={handlePageChange} />
          </div>

          <aside className="flex flex-col gap-6 pt-4 sticky top-0 h-[calc(100vh-200px)] overflow-y-auto">
            <CreateMemeCard isLoggedIn={isLoggedIn} />
          </aside>
        </div>
      </div>
    </div>
  );
}

interface MemeCardProps {
  meme: Meme;
  user: any;
  postInteraction: any;
  deleteInteraction: any;
  setFlagMemeId: (id: string) => void;
  isLoggedIn: boolean;
}

function MemeCard({ meme, user, postInteraction, deleteInteraction, setFlagMemeId, isLoggedIn }: MemeCardProps) {
  const { data: summary } = useGetInteractionSummaryQuery({ memeId: meme.id, userId: user?.id ?? "" }, { skip: !user?.id });

  const [userVoteType, setUserVoteType] = useState<VoteStatus>(
    summary?.userInteraction?.type === InteractionType.UPVOTE
      ? InteractionType.UPVOTE
      : summary?.userInteraction?.type === InteractionType.DOWNVOTE
      ? InteractionType.DOWNVOTE
      : "NONE"
  );
  const [netScoreLocal, setNetScoreLocal] = useState<number>(summary?.netScore ?? meme.netScore);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (targetVoteType: InteractionType.UPVOTE | InteractionType.DOWNVOTE) => {
    if (!isLoggedIn) return toast.error("Please login to cast a vote.");
    if (!user?.id) return toast.error("User ID is missing.");
    if (isVoting) return;

    setIsVoting(true);

    try {
      if (userVoteType === targetVoteType) {
        // Remove vote
        await deleteInteraction({ memeId: meme.id, type: targetVoteType });
        setNetScoreLocal(prev => prev + (targetVoteType === InteractionType.UPVOTE ? -1 : 1));
        setUserVoteType("NONE");
        toast.success("Vote removed!");
      } else if (userVoteType !== "NONE") {
        // Switch vote
        await deleteInteraction({ memeId: meme.id, type: userVoteType as InteractionType });
        await postInteraction({ memeId: meme.id, type: targetVoteType });
        setNetScoreLocal(prev => prev + (targetVoteType === InteractionType.UPVOTE ? 1 : -1) + (userVoteType === InteractionType.UPVOTE ? -1 : 1));
        setUserVoteType(targetVoteType);
        toast.success(`Switched to ${targetVoteType}!`);
      } else {
        // New vote
        await postInteraction({ memeId: meme.id, type: targetVoteType });
        setNetScoreLocal(prev => prev + (targetVoteType === InteractionType.UPVOTE ? 1 : -1));
        setUserVoteType(targetVoteType);
        toast.success(`${targetVoteType === InteractionType.UPVOTE ? "Upvoted" : "Downvoted"}!`);
      }
    } catch (err) {
      toast.error("Failed to update vote.");
      console.error(err);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <article className="bg-gray-200 rounded-2xl shadow-lg p-3 flex flex-col hover:shadow-xl transition-shadow">
      <Link href={`/community/${meme.slug}`} className="relative w-full pb-[100%] overflow-hidden rounded-xl bg-gray-100 mb-3">
        <img src={meme.file?.path} alt={meme.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </Link>

      <div className="flex-1 flex flex-col">
        <div className="text-lg font-semibold text-gray-800 truncate">{meme.title}</div>
        <div className="text-sm text-gray-500">by {meme.author?.email ?? "Anonymous"}</div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              aria-pressed={userVoteType === InteractionType.UPVOTE}
              onClick={() => handleVote(InteractionType.UPVOTE)}
              disabled={isVoting}
              className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50 ${
                userVoteType === InteractionType.UPVOTE ? "bg-green-100 text-green-700" : ""
              }`}
            >
              <ThumbsUp size={18} />
              <span className="text-sm">{userVoteType === InteractionType.UPVOTE ? "You" : "Up"}</span>
            </button>

            <button
              aria-pressed={userVoteType === InteractionType.DOWNVOTE}
              onClick={() => handleVote(InteractionType.DOWNVOTE)}
              disabled={isVoting}
              className={`flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer disabled:opacity-50 ${
                userVoteType === InteractionType.DOWNVOTE ? "bg-red-100 text-red-700" : ""
              }`}
            >
              <ThumbsDown size={18} />
              <span className="text-sm">Down</span>
            </button>

            <div className="text-sm font-medium text-gray-700 px-3 py-1 rounded-full border border-gray-200">{netScoreLocal}</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => navigator.clipboard.writeText(meme.file.path)} title="Share" className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
              <Share2 size={18} />
            </button>
            <button onClick={() => setFlagMemeId(meme.id)} title="Flag" className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
              <Flag size={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
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
