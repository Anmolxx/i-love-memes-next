import React, { useState, useEffect, useRef } from "react";
import { CommentEntity } from "@/utils/dtos/comment.dto";
import { useGetCommentRepliesQuery } from "@/redux/services/comment";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommentItem, { CommentItemProps } from "./CommentItem";

interface ReplyListProps extends Omit<CommentItemProps, "comment"> {
  parentCommentId: string;
  initialReplyCount: number;
  pageSize?: number;
  newLocalReply?: CommentEntity | null;
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
  newLocalReply,
}) => {
  const isShowing = showingReplies.has(parentCommentId);
  const [batchPage, setBatchPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(0);
  const [replyCount, setReplyCount] = useState(initialReplyCount);
  const prevAllRepliesLengthRef = useRef(0);
  const BATCH_LIMIT = 50;
  const MAX_REPLIES = 120;

  const { data: batchData, isLoading, isFetching } = useGetCommentRepliesQuery(
    { parentCommentId, page: batchPage, limit: BATCH_LIMIT },
    { skip: !isShowing }
  );

  const cachedReplies = batchData
    ? (Object.values(batchData.entities)
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date(a!.createdAt).getTime() -
            new Date(b!.createdAt).getTime()
        ) as CommentEntity[])
    : [];

  let allReplies = [...cachedReplies];

  if (newLocalReply && !cachedReplies.some(r => r.id === newLocalReply.id)) {
    allReplies = [newLocalReply, ...allReplies];
    allReplies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  const showLoading = isLoading || isFetching;
  const currentAllRepliesLength = allReplies.length;

  useEffect(() => {
    if (newLocalReply && replyCount === initialReplyCount) {
      setReplyCount(initialReplyCount + 1);
    } else if (allReplies.length > 0) {
      setReplyCount(allReplies.length);
    }
  }, [allReplies.length, newLocalReply, initialReplyCount]);

  useEffect(() => {
    if (isShowing) {
      if (visibleCount === 0 && currentAllRepliesLength > 0) {
        setVisibleCount(Math.min(pageSize, currentAllRepliesLength));
      } else if (currentAllRepliesLength > prevAllRepliesLengthRef.current) {
        setVisibleCount(prev => Math.min(prev + 1, currentAllRepliesLength));
      }
    }
    prevAllRepliesLengthRef.current = currentAllRepliesLength;
  }, [currentAllRepliesLength, isShowing, pageSize]);

  const loadMore = () => {
    const newVisibleCount = visibleCount + pageSize;

    if (newVisibleCount <= currentAllRepliesLength) {
      setVisibleCount(newVisibleCount);
    } else if (currentAllRepliesLength < MAX_REPLIES && cachedReplies.length === BATCH_LIMIT) {
      setBatchPage(prev => prev + 1);
      setVisibleCount(newVisibleCount);
    } else {
      setVisibleCount(currentAllRepliesLength);
    }
  };

  const handleToggleReplies = (show: boolean) => {
    onToggleReplies(parentCommentId, show);
    if (!show) {
      setVisibleCount(0);
      setBatchPage(1);
    }
  };

  const displayedReplies = isShowing ? allReplies.slice(0, visibleCount) : (newLocalReply ? [newLocalReply] : []);

  const hasMoreInBatch = visibleCount < currentAllRepliesLength;
  const needsNextBatch = cachedReplies.length === BATCH_LIMIT && currentAllRepliesLength < MAX_REPLIES;
  const showLoadMoreButton = isShowing && (hasMoreInBatch || needsNextBatch);

  return (
    <div className="flex flex-col mt-2">
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

      {!isShowing && replyCount > 0 && (
        <Button
          variant="link"
          size="sm"
          className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto self-start pl-11"
          onClick={() => onToggleReplies(parentCommentId, true)}
          disabled={showLoading}
        >
          View {replyCount} Replies
        </Button>
      )}

      {showLoading && isShowing && (
        <div className="flex items-center justify-start gap-2 mt-2 pl-11 text-gray-500 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading replies...
        </div>
      )}

      {showLoadMoreButton && (
        <Button
          variant="link"
          size="sm"
          className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto self-start pl-11 mt-1"
          onClick={loadMore}
          disabled={showLoading}
        >
          Load more replies
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
