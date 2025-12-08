"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";
import CommentItem from "./CommentItem";
import ReplyList from "./ReplyList";
import { useCreateCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from "@/redux/services/comment";
import { CommentDto, CommentEntity } from "@/utils/dtos/comment.dto";

const COMMENTS_PER_LOAD = 5;

const handleApiError = (err: any) => {
  const apiError = err?.data;
  if (apiError?.errors && typeof apiError.errors === "object") {
    Object.values(apiError.errors).forEach((msg: any) => {
      if (typeof msg === "string") toast.error(msg);
    });
  } else if (apiError?.message) toast.error(apiError.message);
  else toast.error("Failed to perform action");
};

interface CommentsSectionProps {
  comments: CommentEntity[];
  memeIdentifier: string;
  isLoggedIn: boolean;
}

export default function CommentsSection({ 
  comments, 
  memeIdentifier, 
  isLoggedIn 
}: CommentsSectionProps) {

  const MEME_ID = memeIdentifier;

  const [newComment, setNewComment] = useState("");
  const [visibleCommentCount, setVisibleCommentCount] = useState(COMMENTS_PER_LOAD);
  const [showingReplies, setShowingReplies] = useState(new Set<string>());
  const [newlyCreatedReply, setNewlyCreatedReply] = useState<CommentEntity | null>(null);

  const [createCommentApi] = useCreateCommentMutation();
  const [updateCommentApi] = useUpdateCommentMutation();
  const [deleteCommentApi] = useDeleteCommentMutation();

  const rootCommentsData = useMemo(
    () => comments.slice(0, visibleCommentCount),
    [comments, visibleCommentCount]
  );

  const hasMoreComments = comments.length > visibleCommentCount;

  const handleLoadMore = () => setVisibleCommentCount((prev) => prev + COMMENTS_PER_LOAD);

  const handleToggleReplies = (commentId: string, show: boolean) => {
    const newSet = new Set(showingReplies);
    if (show) newSet.add(commentId);
    else newSet.delete(commentId);
    setShowingReplies(newSet);

    if (!show) {
      if (newlyCreatedReply && newlyCreatedReply.parentCommentId === commentId) {
        setNewlyCreatedReply(null);
      }
    }
  };

  const handleTopLevelSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      await createCommentApi({ content: newComment, memeId: MEME_ID }).unwrap();
      setNewComment("");
      toast.success("Comment added successfully");
      
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleDelete = async (commentId: string, parentId?: string) => {
    try {
      await deleteCommentApi({ id: commentId, parentId, memeId:MEME_ID }).unwrap();
      toast.success("Comment deleted successfully");
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleUpdate = async (commentId: string, content: string, parentId?: string) => {
    try {
      await updateCommentApi({ id: commentId, content, parentId, memeId: MEME_ID }).unwrap();
      toast.success("Comment updated successfully");
      setVisibleCommentCount(COMMENTS_PER_LOAD);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleReply = async (content: string, parentCommentId: string) => {
    try {
      const newReply = await createCommentApi({ content, memeId: MEME_ID, parentCommentId }).unwrap();
      setNewlyCreatedReply(newReply);
      toast.success("Reply added successfully");
      handleToggleReplies(parentCommentId, true);
    } catch (err) {
      handleApiError(err);
      setNewlyCreatedReply(null);
    }
  };

  useEffect(() =>{
    setVisibleCommentCount(COMMENTS_PER_LOAD);
  },[comments.length]);
  
  return (
    <div className="flex flex-col gap-4 bg-white p-10 rounded-xl shadow-lg border border-gray-200 w-full h-full">
      <div className="flex-1 overflow-auto pr-2 pb-2">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-28 h-28 mb-4 text-yellow-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="1.5" className="text-yellow-300" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 9h.01M15 9h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h4 className="text-lg font-semibold mb-2">No one has roasted this meme... yet</h4>
            <p className="text-sm text-gray-500 max-w-xs">
              Looks like the audience is speechless. Be the first to drop a witty comment — fame awaits.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {rootCommentsData.map((comment: CommentEntity) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg border border-gray-100 flex flex-col p-4">
                <CommentItem
                  comment={comment}
                  isLoggedIn={isLoggedIn}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onReply={handleReply}
                  onToggleReplies={handleToggleReplies}
                  showingReplies={showingReplies}
                />
                <ReplyList
                  parentCommentId={comment.id}
                  initialReplyCount={comment.replyCount}
                  isLoggedIn={isLoggedIn}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onReply={handleReply}
                  onToggleReplies={handleToggleReplies}
                  showingReplies={showingReplies}
                  newLocalReply={
                    newlyCreatedReply?.parentCommentId === comment.id
                    ? newlyCreatedReply : null
                  }
                />
              </div>
            ))}
            {hasMoreComments && (
              <div className="flex justify-center mt-2">
                <Button variant="outline" onClick={handleLoadMore} className="w-full max-w-sm">
                  Load More Comments
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-4 border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-gray-800">Comments ({comments.length})</h3>
        </div>
        {isLoggedIn ? (
          <div className="flex gap-2 items-start">
            <Input
              placeholder="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-grow"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newComment.trim()) handleTopLevelSubmit();
              }}
            />
            <Button className="cursor-pointer" onClick={handleTopLevelSubmit} disabled={!newComment.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Post
            </Button>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Please sign in to comment.</div>
        )}
      </div>
    </div>
  );
}