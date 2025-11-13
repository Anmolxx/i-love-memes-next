"use client";

import React, { useState, useEffect, useCallback, useRef, JSX } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthentication from "@/hooks/use-authentication";
import { useGetMemesQuery } from "@/redux/services/meme";
import { usePostInteractionMutation, useDeleteInteractionMutation } from "@/redux/services/interaction";
import { InteractionType } from "@/utils/interaction.dto";
import { toast } from "sonner";

import { MemeSummaryFetcher } from "./MemeInteractionSummary";
import { CreateMemeCard } from "./CreateMeme";
import { NavbarSearch } from "./NavbarSearch";
import { MemeCard } from "./MemeCard";
import { TopMemeSidebar } from "./TopMemeSidebar";
import { FlagDialog } from "./FlagDialog";
import { CommunityPagination } from "@/components/data-table/data-table-community-gallery-pagination";
import { TagSelector } from "./TagsSelector";
import { Meme } from "@/utils/dtos/meme.dto";

type VoteStatus = InteractionType.UPVOTE | InteractionType.DOWNVOTE | "NONE";

interface MemeFinal extends Meme {
  netScore: number;
  userVoteType: VoteStatus;
  isVoting: boolean;
  userHasFlagged: boolean;
}

export default function CommunityGallery(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize states from URL
  const initialPage = parseInt(searchParams.get("page") ?? "1");
  const per_page = parseInt(searchParams.get("per_page") ?? "4");
  const initialSearch = searchParams.get("search") ?? "";
  const initialTags = searchParams.get("tags")?.split(",") ?? [];

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [memes, setMemes] = useState<MemeFinal[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const { user, isLoggedIn } = useAuthentication();
  const [postInteraction, { isLoading: isPosting }] = usePostInteractionMutation();
  const [deleteInteraction, { isLoading: isDeleting }] = useDeleteInteractionMutation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(searchQuery);
    }, 600);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch memes
  const { data, isFetching } = useGetMemesQuery({
    page: currentPage,
    per_page,
    search: debouncedSearch,
    tags: selectedTags.join(","),
  });
  // Sync memes when data changes
  useEffect(() => {
    if (data) {
      const rawMemes: Meme[] = Array.isArray(data) ? data : data?.items ?? [];
      setMemes(
        rawMemes.map(m => ({
          ...m,
          netScore: m.score ?? 0,
          userVoteType: "NONE",
          isVoting: false,
          userHasFlagged: false,
        }))
      );
    }
  }, [data]);


  // Scroll to top on page change
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Helper to update URL
  const updateUrl = useCallback((page: number, search?: string, tags?: string[]) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tags && tags.length > 0) params.set("tags", tags.join(","));
    params.set("page", page.toString());
    params.set("per_page", per_page.toString());
    router.push(`/community?${params.toString()}`);
  }, [router, per_page]);

  // Search handler
  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    updateUrl(1, searchQuery, selectedTags);
  }, [searchQuery, selectedTags, updateUrl]);

  // Pagination handler
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    updateUrl(newPage, searchQuery, selectedTags);
  }, [searchQuery, selectedTags, updateUrl]);

  // Vote handler
  const updateMemeState = useCallback((memeId: string, summary: any) => {
    setMemes(prev =>
      prev.map(m => {
        if (m.id === memeId) {
          const userVoteType: VoteStatus =
            summary.userInteraction?.type === InteractionType.UPVOTE
              ? InteractionType.UPVOTE
              : summary.userInteraction?.type === InteractionType.DOWNVOTE
              ? InteractionType.DOWNVOTE
              : "NONE";
          const userHasFlagged = summary.flagCount > 0;
          return { ...m, netScore: summary.netScore, userVoteType, userHasFlagged };
        }
        return m;
      })
    );
  }, []);

  const handleVote = useCallback(
    async (memeId: string, targetVoteType: InteractionType.UPVOTE | InteractionType.DOWNVOTE) => {
      if (!isLoggedIn) return toast.error("Please login to cast a vote.");
      if (!user?.id) return toast.error("User ID is missing.");

      setMemes(prev => prev.map(m => (m.id === memeId ? { ...m, isVoting: true } : m)));
      const memeToUpdate = memes.find(m => m.id === memeId);
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
          toast.success(`${targetVoteType === InteractionType.UPVOTE ? "Upvoted" : "Downvoted"}!`);
        }

        setMemes(prev =>
          prev.map(m =>
            m.id === memeId ? { ...m, netScore: newNetScore, userVoteType: newUserVoteType, isVoting: false } : m
          )
        );
      } catch {
        toast.error("Failed to update vote.");
        setMemes(prev => prev.map(m => (m.id === memeId ? { ...m, isVoting: false } : m)));
      }
    },
    [isLoggedIn, user?.id, memes, postInteraction, deleteInteraction]
  );

  const shareMeme = (meme: Meme) => {
    const shareData = {
      title: meme.title,
      text: `Check out this meme: ${meme.title}`,
      url: `${window.location.origin}/community/${meme.slug}`,
    };
    if (navigator.share) navigator.share(shareData).catch(() => navigator.clipboard.writeText(shareData.url).then(() => toast.info("Link copied!")));
    else navigator.clipboard.writeText(shareData.url).then(() => toast.info("Link copied!"));
  };

  const [flagMemeId, setFlagMemeId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState<string>("");
  const [flagComment, setFlagComment] = useState<string>("");
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  const submitFlag = useCallback(async () => {
    if (!flagMemeId || !flagReason || isSubmittingFlag) return;
    setIsSubmittingFlag(true);

    try {
      await postInteraction({ memeId: flagMemeId, type: InteractionType.FLAG, reason: flagReason, note: flagComment || undefined });
      setMemes(prev => prev.map(m => (m.id === flagMemeId ? { ...m, userHasFlagged: true } : m)));
      toast.success("Meme flagged successfully!");
      resetFlagDialog();
    } catch {
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

  const memesWithTags = memes.map((meme) => {
    const activeTags = meme.tags?.filter(tag => !tag.deletedAt) ?? [];
    return {
      ...meme,
      displayedTags: activeTags.slice(0, 3),
      hiddenTags: activeTags.slice(3),
    };
  });
  console.log(memesWithTags)
  const topMeme = memes.reduce((top, current) => (current.netScore > (top?.netScore ?? 0) ? current : top), null as MemeFinal | null);

  return (
    <div className="flex flex-col h-full">
      {memes.map(meme => (
        <MemeSummaryFetcher key={`summary-${meme.id}`} memeId={meme.id} userId={user?.id} updateMemeState={updateMemeState} />
      ))}

      <div className="relative">
        <nav className="w-full sticky top-0 z-50 bg-white/70 backdrop-blur">
          <div className="max-w-6xl px-4 py-2 flex items-center gap-6 mx-auto">
            <Link href="/">
              <div className="relative h-15 w-30 flex-shrink-0">
                <NextImage src="/brand/ilovememes-logo.png" alt="I Love Memes" fill className="object-contain" priority />
              </div>
            </Link>

            <NavbarSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              isFetching={isFetching}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              availableTags={availableTags}
            />
            <TagSelector setAvailableTags={setAvailableTags} />;
          </div>
        </nav>
      </div>

      <div className="max-w-[110rem] mx-auto p-4 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6 h-[calc(100vh-150px)]">
          <div ref={scrollContainerRef} className="overflow-y-auto pr-2 hide-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {memes.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  <p className="text-xl mb-2">
                    Oops! We couldn’t find any memes
                    {searchQuery ? ` for "${searchQuery}"` : ""}
                    {selectedTags.length > 0 ? ` with tags: ${selectedTags.join(", ")}` : ""} 😅
                  </p>
                  <p className="text-sm">Try another search or create your own meme!</p>
                </div>
              ) : (
                memesWithTags.map(meme => (
                  <MemeCard
                    key={meme.id}
                    meme={meme}
                    handleVote={handleVote}
                    shareMeme={shareMeme}
                    setFlagMemeId={setFlagMemeId}
                    isPosting={isPosting}
                    isDeleting={isDeleting}
                  />
                ))
              )}
            </div>

            {memes.length > 0 && (
              <div className="mt-4">
                <CommunityPagination
                  page={currentPage}
                  pageCount={data?.meta?.totalPages ?? 0}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-6 pt-4 sticky top-0 h-[calc(100vh-200px)] overflow-y-auto">
            <CreateMemeCard isLoggedIn={isLoggedIn} />
            {topMeme && <TopMemeSidebar topMeme={topMeme} />}
          </aside>
        </div>
      </div>

      <FlagDialog
        flagMemeId={flagMemeId}
        flagReason={flagReason}
        setFlagReason={setFlagReason}
        flagComment={flagComment}
        setFlagComment={setFlagComment}
        submitFlag={submitFlag}
        resetFlagDialog={resetFlagDialog}
        isSubmittingFlag={isSubmittingFlag}
      />
    </div>
  );
}
