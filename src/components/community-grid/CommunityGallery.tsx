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
import { Footer } from "@/sections/Footer";

type VoteStatus = InteractionType.UPVOTE | InteractionType.DOWNVOTE | "NONE";

export default function CommunityGallery(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPage = parseInt(searchParams.get("page") ?? "1");
  const per_page = parseInt(searchParams.get("limit") ?? "10");
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
          let scoreChange = 0;

          if (isChangingVote) {
            await deleteInteraction({ memeId: meme.id, type: currentVote });
          }

          await postInteraction({ memeId: meme.id, type: targetVoteType });

          if (targetVoteType === InteractionType.UPVOTE) {
            scoreChange = isChangingVote && currentVote === InteractionType.DOWNVOTE ? 1 : -1;
          } else {
            scoreChange = isChangingVote && currentVote === InteractionType.UPVOTE ? 1 : -1;
          }

          setMemes(memes.map(m =>
            m.id === memeId
              ? {
                  ...m,
                  interactionSummary: {
                    ...m.interactionSummary!,
                    userInteractions: [
                      { type: targetVoteType, createdAt: new Date().toISOString() }
                    ],
                    netScore: m.interactionSummary!.netScore + scoreChange,
                  }
                } as Meme
              : m
          ));

          if (isChangingVote) {
            toast.success("Vote updated!");
          } else if (targetVoteType === InteractionType.UPVOTE) {
            toast.success("Meme upvoted! 👍");
          } else {
            toast.success("Meme downvoted! 👎");
          }
        }

      } catch (err) {
        console.error(err);
        toast.error("Failed to update vote.");
      }
    },
    [isLoggedIn, isPostingInteraction, isDeletingInteraction, memes, postInteraction, deleteInteraction]
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
     <div className="flex flex-col h-full min-h-screen">
       {/* Navbar */}
       <div className="relative">
         <nav className="w-full sticky top-0 z-50 bg-white/70 backdrop-blur">
           <div className="max-w-[110rem] px-4 flex items-center gap-6 mx-auto mb-5">
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
 
       {/* Content */}
       <div className="max-w-[110rem] mx-auto p-4 flex flex-col gap-6 flex-1">
         <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6 h-[calc(100vh-250px)]">
           {/* Scrollable memes */}
           <div ref={scrollContainerRef} className="overflow-y-auto pr-2 hide-scrollbar max-h-[calc(100vh-250px)]">
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
                     isPosting={isPostingInteraction}
                     isDeleting={isDeletingInteraction}
                   />
                 ))
               )}
             </div>
           </div>
 
           {/* Sidebar */}
           <aside className="flex flex-col gap-6 pt-4 sticky top-0 h-[calc(100vh-250px)] overflow-y-auto">
             <CreateMemeCard />
             {topMeme && <TopMemeSidebar topMeme={topMeme} />}
           </aside>
         </div>
 
         {/* Static Pagination */}
         {memes.length > 0 && (
           <div className="sticky bottom-0 bg-white/70 z-20 px-2 py-2">
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
 }