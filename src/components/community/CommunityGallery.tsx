"use client";

import React, { useState, useEffect, useCallback, useRef, JSX } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthentication from "@/hooks/use-authentication";
import { useGetMemesQuery } from "@/redux/services/meme";
import { usePostInteractionMutation, useDeleteInteractionMutation } from "@/redux/services/interaction";
import { InteractionType } from "@/utils/dtos/interaction.dto";
import { toast } from "sonner";
import { CreateMemeCard } from "./CreateMeme";
import { NavbarSearch } from "./NavbarSearch";
import { MemeCard } from "./MemeCard";
import { TopMemeSidebar } from "./TopMemeSidebar";
import { FlagDialog } from "./FlagDialog";
import { CommunityPagination } from "@/components/data-table/data-table-community-gallery-pagination";
import { TagSelector } from "./TagsSelector";
import { Meme } from "@/utils/dtos/meme.dto";

type VoteStatus = InteractionType.UPVOTE | InteractionType.DOWNVOTE | "NONE";

export default function CommunityGallery(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPage = parseInt(searchParams.get("page") ?? "1");
  const per_page = parseInt(searchParams.get("limit") ?? "4");
  const initialSearch = searchParams.get("search") ?? "";
  const initialTags = searchParams.getAll("tags") ?? [];

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const { user, isLoggedIn } = useAuthentication();
  const [postInteraction] = usePostInteractionMutation();
  const [deleteInteraction] = useDeleteInteractionMutation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [flagMemeId, setFlagMemeId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState<string>("");
  const [flagComment, setFlagComment] = useState<string>("");
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(searchQuery);
    }, 800);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data, isFetching } = useGetMemesQuery({
    page: currentPage,
    limit: per_page,
    search: debouncedSearch,
    tags: selectedTags,
  });

  useEffect(() => {
    if (!data) return;
    const rawMemes: Meme[] = Array.isArray(data) ? data : data.items ?? [];
    setMemes(rawMemes);
  }, [data]);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const updateUrl = useCallback(
    (page: number, search?: string, tags?: string[]) => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", per_page.toString());
      if (search) params.set("search", search);
      tags?.forEach(tag => params.append("tags", tag));
      router.push(`/community?${params.toString()}`);
    },
    [router, per_page]
  );

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    updateUrl(1, searchQuery, selectedTags);
  }, [searchQuery, selectedTags, updateUrl]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      updateUrl(newPage, searchQuery, selectedTags);
    },
    [searchQuery, selectedTags, updateUrl]
  );

  const handleVote = useCallback(
    async (memeId: string, targetVoteType: InteractionType.UPVOTE | InteractionType.DOWNVOTE) => {
      if (!isLoggedIn) return toast.error("Please login to cast a vote.");
      if (!user?.id) return toast.error("User ID is missing.");

      const meme = memes.find((m) => m.id === memeId);
      if (!meme) return;

      const interactions = meme.interactionSummary?.userInteractions ?? [];
      const currentVote = interactions.find((i) => i.type === InteractionType.UPVOTE || i.type === InteractionType.DOWNVOTE)
        ?.type as VoteStatus;

      try {
        if (currentVote === targetVoteType) {
          await deleteInteraction({ memeId, type: targetVoteType });
        } else {
          if (currentVote !== "NONE") {
            await deleteInteraction({ memeId, type: currentVote });
          }
          await postInteraction({ memeId, type: targetVoteType });
        }

        toast.success("Vote updated!");
      } catch {
        toast.error("Failed to update vote.");
      }
    },
    [isLoggedIn, user?.id, memes, postInteraction, deleteInteraction]
  );
  useEffect(() => {
      setCurrentPage(1);
      updateUrl(1, searchQuery, selectedTags);
    }, [selectedTags, searchQuery, updateUrl]);
    

  const shareMeme = (meme: Meme) => {
    const shareData = {
      title: meme.title,
      text: `Check out this meme: ${meme.title}`,
      url: `${window.location.origin}/community/${meme.slug}`,
    };
    if (navigator.share)
      navigator.share(shareData).catch(() => navigator.clipboard.writeText(shareData.url).then(() => toast.info("Link copied!")));
    else navigator.clipboard.writeText(shareData.url).then(() => toast.info("Link copied!"));
  };

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

      resetFlagDialog();
      toast.success("Meme flagged successfully!");
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

  const topMeme =
    memes.length > 0
      ? memes.reduce((best, m) => {
          const score = m.interactionSummary?.netScore ?? 0;
          if (!best) return m;
          return score > (best.interactionSummary?.netScore ?? 0) ? m : best;
        }, null as Meme | null)
      : null;

  return (
    <div className="flex flex-col h-full">
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
            <TagSelector setAvailableTags={setAvailableTags} />
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
                memes.map((meme) => (
                  <MemeCard
                    key={meme.id}
                    meme={meme}
                    handleVote={handleVote}
                    shareMeme={shareMeme}
                    setFlagMemeId={setFlagMemeId}
                    isPosting={false}
                    isDeleting={false}
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
