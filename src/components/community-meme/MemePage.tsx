"use client";

import React, { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGetMemeBySlugOrIdQuery } from "@/redux/services/meme";
import {
  useGetCommentsByMemeQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "@/redux/services/comment";
import useAuthentication from "@/hooks/use-authentication";
import { Navbar } from "@/components/ui/extension/navbar-internal";
import AppSidebar from "@/components/organisms/app-sidebar-internal";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Footer } from "@/sections/Footer";
import { Meme } from "@/utils/dtos/meme.dto";
import MemeContent from "./MemeContent";
import MemeActionsSidebar from "./MemeActionsSidebar";
import FlagMemeDialog from "./FlagMemeDialog";
import { CommentDto } from "@/utils/dtos/comment.dto";
import { CommentActionsProvider } from "@/context/CommentActions";

export default function MemePage() {
  const { slug } = useParams();
  const { user, isLoggedIn } = useAuthentication();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useGetMemeBySlugOrIdQuery(slug as string, { skip: !slug });
  const meme: Meme | null = data?.data ?? null;

  const { data: commentsData, refetch: refetchComments } = useGetCommentsByMemeQuery(
    { slugOrId: slug as string },
    { skip: !slug }
  );
  const comments: CommentDto[] = commentsData?.items ?? [];

  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  useEffect(() => {
    if (slug) {
      refetch();
      refetchComments();
    }
  }, [slug, refetch, refetchComments]);

  const handleAddComment = useCallback(async (content: string, parentCommentId?: string) => {
    if (!content.trim()) return;
    
    if (!meme || !meme.id) {
      toast.error("Meme data is not fully loaded. Please wait.");
      return;
    }
    
    try {
      await createComment({ content, memeId: meme.id, parentCommentId }).unwrap();
      refetchComments();
      toast.success(parentCommentId ? "Reply added!" : "Comment added!");
    } catch {
      toast.error("Failed to add comment");
    }
  }, [meme, createComment, refetchComments]);

  const handleUpdateComment = useCallback(async (id: string, content: string) => {
    if (!content.trim()) return;
    try {
      await updateComment({ id, content }).unwrap();
      refetchComments();
      toast.success("Comment updated!");
    } catch {
      toast.error("Failed to update comment");
    }
  }, [updateComment, refetchComments]);

  const handleDeleteComment = useCallback(async (id: string) => {
    try {
      await deleteComment({ id }).unwrap();
      refetchComments();
    } catch {
      toast.error("Failed to delete comment");
    }
  }, [deleteComment, refetchComments]);

  const [flagMemeId, setFlagMemeId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState<string>("");
  const [flagComment, setFlagComment] = useState<string>("");

  const vote = useCallback((newVote: number) => {
    toast.success(`${newVote === 1 ? "Upvoted" : newVote === -1 ? "Downvoted" : "Cleared"}`);
  }, []);

  const shareMeme = useCallback(async (): Promise<void> => {
    const url = meme?.file?.path;
    if (!url) {
      toast.error("No meme file found");
      return;
    }
    try {
      if (navigator.share) await navigator.share({ title: meme.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      toast.error("Share failed");
    }
  }, [meme]);

  const resetFlagDialog = useCallback(() => {
    setFlagMemeId(null);
    setFlagReason("");
    setFlagComment("");
  }, []);

  const submitFlag = useCallback(() => {
    toast.success("Thanks! The moderation team will review this.");
    resetFlagDialog();
  }, [resetFlagDialog]);

  const handleCaptionClick = useCallback(() => {
    if (!meme?.template) {
      toast.error("This meme has no base template.");
      return;
    }
    router.push(`/meme/${meme.template.slug}`);
  }, [meme, router]);

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (error || !meme) return <div className="text-center mt-10">Meme not found</div>;

  const commentActions = {
    onAddComment: handleAddComment,
    onUpdateComment: handleUpdateComment,
    onDeleteComment: handleDeleteComment,
    memeId: meme.id,
  };

  return (
    <SidebarProvider>
      <div className="group/sidebar-wrapper flex min-h-svh w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 bg-gray-50">
          <Navbar />
          <div className="max-w-6xl mx-auto p-4 flex flex-col md:flex-row gap-6 mt-5">
            <CommentActionsProvider actions={commentActions}>
              <MemeContent
                meme={meme}
                vote={vote}
                shareMeme={shareMeme}
                setFlagMemeId={setFlagMemeId}
                comments={comments}
                isLoggedIn={isLoggedIn}
              />
              <MemeActionsSidebar meme={meme} handleCaptionClick={handleCaptionClick} />
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
          />
          <div className="mt-20">
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}