"use client";

import React, { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGetMemeBySlugOrIdQuery } from "@/redux/services/meme";
import { usePostInteractionMutation } from "@/redux/services/interaction";
import {
  useGetCommentsByMemeQuery,
} from "@/redux/services/comment";
import useAuthentication from "@/hooks/use-authentication";
import { Footer } from "@/sections/Footer";
import { Meme } from "@/utils/dtos/meme.dto";
import MemeContent from "./MemeContent";
import FlagMemeDialog from "./FlagMemeDialog";
import { CommentEntity, CommentSortOptions } from "@/utils/dtos/comment.dto"; 
import { CommentActionsProvider } from "@/context/CommentActions";
import { NavbarSearch } from "../community-grid/NavbarSearch";
import { TagSelector } from "../community-grid/TagsSelector";
import CommunityMemeSkeleton from "./CommunityMemeSkeleton";
import { FooterSkeleton } from "@/sections/skeletons/FooterSkeleton";
import { rootCommentsAdapter } from "@/redux/adapters/commentAdapters";

export default function MemePage() {
  const { slug } = useParams();
  const { user, isLoggedIn } = useAuthentication();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const [isFetching, setIsFetching] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const [commentLimit, setCommentLimit] = useState(20);
 
  const [commentSortOptions, setCommentSortOptions] = useState<CommentSortOptions>('newest'); 
  
  const handleSearch = useCallback(() => {

    let searchPath = `/community?search=${encodeURIComponent(searchQuery)}`;
    if (selectedTags.length > 0) {
        searchPath += `&tags=${selectedTags.join(',')}`;
    }
    router.push(searchPath);
  }, [searchQuery, selectedTags, router]);

  const { data, isLoading, error, refetch } = useGetMemeBySlugOrIdQuery(slug as string, { skip: !slug });
  const meme: Meme | null = data?.data ?? null;

  const { data: commentsState, refetch: refetchComments } = useGetCommentsByMemeQuery(
    { 
      slugOrId: slug as string,
      page: commentPage,
      limit: commentLimit,
      sortOptions: commentSortOptions,
    },
    { skip: !slug }
  );
  
  const comments: CommentEntity[] = commentsState
    ? rootCommentsAdapter.getSelectors().selectAll(commentsState)
    : [];
    
  const [flagMeme, { isLoading: isFlagging }] = usePostInteractionMutation();

  useEffect(() => {
    if (slug) {
      refetch();
      refetchComments();
    }
  }, [slug, refetch, refetchComments]);

  const [flagMemeId, setFlagMemeId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState<string>("");
  const [flagComment, setFlagComment] = useState<string>("");

  const vote = useCallback((newVote: number) => {
    toast.success(`${newVote === 1 ? "Upvoted" : newVote === -1 ? "Downvoted" : "Cleared"}`);
  }, []);

  const getSharableFile = async (url: string, title: string): Promise<File | undefined> => {
        try {
            const response = await fetch(url);
            if (!response.ok) return undefined;
            const blob = await response.blob();
            const extension = url.split('.').pop()?.toLowerCase() || 'jpg';
            const mimeType = response.headers.get('content-type') || `image/${extension}`;
            return new File([blob], `${title}.${extension}`, { type: mimeType });
        } catch (error) {
            return undefined;
        }
    };
    
    const shareMeme = useCallback(async (meme: Meme): Promise<void> => {
        const url = meme?.file?.path;
        const title = meme?.title || "Check out this meme!";
    
        if (!url) {
            toast.error("No meme file found");
            return;
        }
    
        if (!navigator.share) {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
            return;
        }
    
        const file = await getSharableFile(url, title);
        const shareData: ShareData = { title, url };
    
        try {
            if (file) {
                await navigator.share({ ...shareData, files: [file] });
                return;
            }
            await navigator.share(shareData);
    
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }
            await navigator.clipboard.writeText(url);
            toast.success("Share failed. Link copied to clipboard!");
        }
    }, []);

  const resetFlagDialog = useCallback(() => {
    setFlagMemeId(null);
    setFlagReason("");
    setFlagComment("");
  }, []);

  const submitFlag = useCallback(async () => {
    if (!flagMemeId || !flagReason) return;

    try {
      await flagMeme({
        memeId: flagMemeId,
        type: "FLAG",
        reason: flagReason,
        note: flagComment,
      }).unwrap();
      toast.success("Thanks! The moderation team will review this.");
      resetFlagDialog();
    } catch (err: any) {
      const apiError = err?.data;
      if (apiError?.errors && typeof apiError.errors === "object") {
        Object.values(apiError.errors).forEach((msg: any) => { if (typeof msg === "string") toast.error(msg); });
      } else if (apiError?.message) toast.error(apiError.message);
      else toast.error("Failed to submit flag.");
    }
  }, [flagMemeId, flagReason, flagComment, flagMeme, resetFlagDialog]);

  const handleCaptionClick = useCallback(() => {
    if (!meme?.template) {
      toast.error("This meme has no base template.");
      return;
    }
    router.push(`/meme/${meme.template.slug}`);
  }, [meme, router]);

  if (isLoading) return <CommunityMemeSkeleton />;
  if (error || !meme) return <div className="text-center mt-10">Meme not found</div>;

  const commentActions = {
    memeId: meme.id,
  };

  return (
    <div className="flex min-h-svh w-full flex-col bg-gray-50">
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
          <div className="w-full max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-6 mt-5 items-stretch">
            <CommentActionsProvider actions={commentActions}>
              <MemeContent
                meme={meme}
                vote={vote}
                shareMeme={shareMeme}
                setFlagMemeId={setFlagMemeId}
                comments={comments}
                isLoggedIn={isLoggedIn}
                handleCaptionClick={handleCaptionClick}
              />
            </CommentActionsProvider>
          </div>
          <FlagMemeDialog
            memeId={meme.id}
            flagMemeId={flagMemeId}
            flagReason={flagReason}
            setFlagReason={setFlagReason}
            flagComment={flagComment}
            setFlagComment={setFlagComment}
            submitFlag={submitFlag}
            resetFlagDialog={resetFlagDialog}
            isSubmitting={isFlagging}
          />
          <div className="mt-20">
            {isLoading ? <FooterSkeleton /> : <Footer />}
          </div>
    </div>
  );
}