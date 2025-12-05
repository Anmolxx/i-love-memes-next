import React, { useState } from "react";
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
}) => {
  const isShowing = showingReplies.has(parentCommentId);
  const [page, setPage] = useState(1);

  const { data: repliesData, isLoading, isFetching } = useGetCommentRepliesQuery(
    { parentCommentId, page },
    {
      skip:!isShowing,
      selectFromResult: ({ data, isLoading, isFetching }) => {
        const repliesArr = data ? Object.values(data.entities).filter(Boolean) : [];
        return {
          data: repliesArr.sort(
            (a, b) => new Date(a!.createdAt).getTime() - new Date(b!.createdAt).getTime()
          ) as CommentEntity[],
          isLoading,
          isFetching,
        };
      },
    }
  );

  const directReplies: CommentEntity[] = repliesData || [];
  const showLoading = isLoading || isFetching;

  const loadMoreReplies = () => setPage((prev) => prev + 1);

  return (
    <div className="flex flex-col mt-2">
      {initialReplyCount > 0 && !isShowing && (
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

      {isShowing &&
        directReplies.map((reply) => (
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
{/* 
      {isShowing && directReplies.length === pageSize && (
        <Button
          variant="link"
          size="sm"
          className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto self-start pl-11 mt-1"
          onClick={loadMoreReplies}
          disabled={showLoading}
        >
          {showLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Load more replies"}
        </Button>
      )} */}

      {isShowing && directReplies.length > 0 && (
        <Button
          variant="link"
          size="sm"
          className="text-sm text-gray-600 hover:text-gray-800 p-0 h-auto self-start pl-11 mt-1"
          onClick={() => {
            onToggleReplies(parentCommentId, false);
            setPage(1);
          }}
        >
          Hide Replies
        </Button>
      )}
    </div>
  );
};

export default ReplyList;
