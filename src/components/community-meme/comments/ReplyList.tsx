import React, { useState, useEffect } from "react";
import { CommentEntity } from "@/utils/dtos/comment.dto";
import { useGetCommentRepliesQuery } from "@/redux/services/comment";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommentItem, { CommentItemProps } from "./CommentItem";

interface ReplyListProps extends Omit<CommentItemProps, "comment"> {
  parentCommentId: string;
  initialReplyCount: number;
  pageSize?: number;
}

const ReplyList: React.FC<ReplyListProps> = ({
  parentCommentId,
  isLoggedIn,
  onDelete,
  onUpdate,
  onReply,
  onToggleReplies,
  showingReplies,
  initialReplyCount,
  pageSize = 5,
}) => {
  const isShowing = showingReplies.has(parentCommentId);
  const [batchPage, setBatchPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(0);
  const BATCH_LIMIT = 50;
  const MAX_REPLIES = 120;

  const { data: batchData, isLoading, isFetching } = useGetCommentRepliesQuery(
    { parentCommentId, page: batchPage, limit: BATCH_LIMIT },
    { skip: !isShowing }
  );

  const allReplies = batchData
    ? Object.values(batchData.entities).filter(Boolean) as CommentEntity[]
    : [];

  const showLoading = isLoading || isFetching;

  useEffect(() => {
    if (isShowing && visibleCount === 0 && allReplies.length > 0) {
      setVisibleCount(Math.min(pageSize, allReplies.length));
    }
  }, [allReplies.length, isShowing, pageSize, visibleCount]);

  const loadMore = () => {
    if (visibleCount < allReplies.length && visibleCount < MAX_REPLIES) {
      setVisibleCount((prev) => prev + pageSize);
    } else if (allReplies.length < MAX_REPLIES && batchData && batchData.ids.length === BATCH_LIMIT) {
      setBatchPage((prev) => prev + 1);
    }
  };

  const handleToggleReplies = (show: boolean) => {
    onToggleReplies(parentCommentId, show);
    if (!show) {
      setVisibleCount(0);
      setBatchPage(1);
    }
  };

  const displayedReplies = allReplies.slice(0, visibleCount);
  const hasMore = visibleCount > 0 && visibleCount < allReplies.length && displayedReplies.length < MAX_REPLIES;

  return (
    <div className="flex flex-col mt-2">
      {!isShowing && initialReplyCount > 0 && (
        <Button
          variant="link"
          size="sm"
          className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto self-start pl-11"
          onClick={() => onToggleReplies(parentCommentId, true)}
          disabled={showLoading}
        >
          {showLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `View ${initialReplyCount} Replies`}
        </Button>
      )}

      {showLoading && isShowing && (
        <div className="flex items-center justify-start gap-2 mt-2 pl-11 text-gray-500 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading replies...
        </div>
      )}

      {displayedReplies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          isLoggedIn={isLoggedIn}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onReply={onReply}
          onToggleReplies={onToggleReplies}
          showingReplies={showingReplies}
        />
      ))}

      {isShowing && hasMore && (
        <Button
          variant="link"
          size="sm"
          className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto self-start pl-11 mt-1"
          onClick={loadMore}
          disabled={showLoading}
        >
          {showLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Load more replies"}
        </Button>
      )}

      {isShowing && displayedReplies.length > 0 && (
        <Button
          variant="link"
          size="sm"
          className="text-sm text-gray-600 hover:text-gray-800 p-0 h-auto self-start pl-11 mt-1"
          onClick={() => handleToggleReplies(false)}
        >
          Hide Replies
        </Button>
      )}
    </div>
  );
};

export default ReplyList;
