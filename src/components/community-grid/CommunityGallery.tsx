"use client";

import React, { useState, useEffect, useCallback, useRef, JSX } from "react";
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
import { Footer } from "@/sections/Footer";
import { TopMemeSidebarSkeleton } from "./skeletons/TopMemeSidebarSkeleton";
import { CreateMemeSkeleton } from "./skeletons/CreateMemeSkeleton";

type VoteStatus = InteractionType.UPVOTE | InteractionType.DOWNVOTE | "NONE";

export default function CommunityGallery(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPage = parseInt(searchParams.get("page") ?? "1");
  const per_page = parseInt(searchParams.get("limit") ?? "9");
  const initialSearch = searchParams.get("search") ?? "";
  const initialTags = searchParams.getAll("tags") ?? [];

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const { user, isLoggedIn } = useAuthentication();
  const [postInteraction, { isLoading: isPostingInteraction }] = usePostInteractionMutation();
  const [deleteInteraction, { isLoading: isDeletingInteraction }] = useDeleteInteractionMutation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [flagMemeId, setFlagMemeId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState<string>("");
  const [flagComment, setFlagComment] = useState<string>("");
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  // Debounce search
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

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", per_page.toString());
    if (debouncedSearch) params.set("search", debouncedSearch);
    selectedTags.forEach(tag => params.append("tags", tag));
    router.replace(`/community?${params.toString()}`);
  }, [selectedTags, debouncedSearch, currentPage, router, per_page]);

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    setDebouncedSearch(searchQuery);
  }, [searchQuery]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleTagClick = useCallback((tagName: string) => {
    setCurrentPage(1);
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  }, []);

  const handleVote = useCallback(
    async (memeId: string, targetVoteType: InteractionType.UPVOTE | InteractionType.DOWNVOTE) => {
      if (!isLoggedIn) return toast.error("Please login to cast a vote.");
      if (isPostingInteraction || isDeletingInteraction) return;

      const meme = memes.find((m) => m.id === memeId);
      if (!meme) return;

      const interactions = meme.interactionSummary?.userInteractions ?? [];
      const currentVote = interactions.find(
        (i) => i.type === InteractionType.UPVOTE || i.type === InteractionType.DOWNVOTE
      )?.type as VoteStatus;

      try {
        if (currentVote === targetVoteType) {
          await deleteInteraction({ memeId: meme.id, type: targetVoteType });
          setMemes(memes.map(m =>
            m.id === memeId
              ? {
                  ...m,
                  interactionSummary: {
                    ...m.interactionSummary!,
                    userInteractions: [],
                    netScore: m.interactionSummary!.netScore - (targetVoteType === InteractionType.UPVOTE ? 1 : -1),
                  }
                } as Meme
              : m
          ));
          toast.info("Vote removed.");
        } else {
          const isChangingVote = currentVote && currentVote !== "NONE";
          if (isChangingVote) {
            await deleteInteraction({ memeId: meme.id, type: currentVote });
          }
          await postInteraction({ memeId: meme.id, type: targetVoteType });

          setMemes(memes.map(m =>
            m.id === memeId
              ? {
                  ...m,
                  interactionSummary: {
                    ...m.interactionSummary!,
                    userInteractions: [
                      { type: targetVoteType, createdAt: new Date().toISOString() }
                    ],
                    netScore: m.interactionSummary!.netScore + (targetVoteType === InteractionType.UPVOTE ? 1 : -1) - (isChangingVote ? (currentVote === InteractionType.UPVOTE ? 1 : -1) : 0),
                  }
                } as Meme
              : m
          ));

          toast.success(isChangingVote ? "Vote updated!" : targetVoteType === InteractionType.UPVOTE ? "Meme upvoted! 👍" : "Meme downvoted! 👎");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to update vote.");
      }
    },
    [isLoggedIn, isPostingInteraction, isDeletingInteraction, memes, postInteraction, deleteInteraction]
  );

  const getSharableFile = async (url: string, title: string): Promise<File | undefined> => {
    try {
      const response = await fetch(url);
      if (!response.ok) return undefined;
      const blob = await response.blob();
      const extension = url.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = response.headers.get('content-type') || `image/${extension}`;
      return new File([blob], `${title}.${extension}`, { type: mimeType });
    } catch {
      return undefined;
    }
  };

  const shareMeme = async (meme: Meme) => {
    const fileUrl = meme?.file?.path;
    const title = meme?.title || meme.title;
    const shareUrl = `${window.location.origin}/community/${meme.slug}`;

    if (!fileUrl) {
      toast.error("No meme file found");
      return;
    }

    const shareData: ShareData = {
      title,
      text: `Check out this meme: ${title}`,
      url: shareUrl
    };

    const copyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Link copied to clipboard! 🔗");
      } catch {
        toast.error("Failed to copy link.");
      }
    };

    if (navigator.share) {
      const file = await getSharableFile(fileUrl, title);
      try {
        if (file) await navigator.share({ ...shareData, files: [file] });
        else await navigator.share(shareData);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        await copyToClipboard(shareUrl);
      }
    } else {
      await copyToClipboard(shareUrl);
    }
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
      toast.success("Thanks! The moderation team will review this.");
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
    <div className="flex flex-col h-full min-h-screen">
    
      <div className="relative">
        <nav className="w-full sticky top-0 z-50 bg-white/70 backdrop-blur">
          <div className="max-w-[110rem] px-2 sm:px-4 flex items-center gap-6 mx-auto mb-5">
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
  
    
      <div className="max-w-[110rem] mx-auto px-2 sm:px-4 py-4 flex flex-col gap-4 flex-1 w-full"> 
        

        <div className="md:hidden">
          <div className="flex flex-col gap-6 mb-6">
            {isFetching ? <CreateMemeSkeleton /> : <CreateMemeCard />}
            {isFetching ? <TopMemeSidebarSkeleton /> : topMeme && <TopMemeSidebar topMeme={topMeme} />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6">
          
          <div ref={scrollContainerRef} className="w-full">
          
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
             {memes.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 sm:col-span-2 lg:col-span-3">
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
                    isPosting={isPostingInteraction}
                    isDeleting={isDeletingInteraction}
                    handleTagClick={handleTagClick}
                  />
                ))
              )}
            </div>
          </div>
  
         
         <aside className="hidden md:flex flex-col gap-6 sticky top-0 h-[calc(100vh-250px)]">
           {isFetching ? <CreateMemeSkeleton /> : <CreateMemeCard />}
           {isFetching ? <TopMemeSidebarSkeleton /> : topMeme && <TopMemeSidebar topMeme={topMeme} />}
         </aside>
        </div>
  
        {/* Pagination */}
        {memes.length > 0 && (
          <div className="bg-white/70 z-10 p-2 relative">
            <CommunityPagination
              page={currentPage}
              pageCount={data?.meta?.totalPages ?? 0}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
  
      {/* Flag Dialog */}
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
  
      {/* Footer */}
      <Footer />
    </div>
  );
};