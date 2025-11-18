import React, { useState, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CommentDto } from "@/utils/dtos/comment.dto"
import { useCommentActions } from "@/context/CommentActions"
import { Edit, Trash2, Send, CornerDownRight, User, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useGetCommentRepliesQuery } from "@/redux/services/comment"
import { toast } from 'sonner'

const COMMENTS_PER_LOAD = 5

interface CommentActions {
  onAddComment: (content: string, parentCommentId?: string) => Promise<void> | void
  onUpdateComment: (id: string, content: string) => Promise<void> | void
  onDeleteComment: (id: string) => Promise<void> | void
  memeId: string
}

interface CommentItemProps {
  comment: CommentDto
  isLoggedIn: boolean
  actions: CommentActions
  isReply: boolean
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, isLoggedIn, actions, isReply }) => {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState(comment.content)
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [showReplies, setShowReplies] = useState(false)

  const { data: directReplies = [], isLoading: isLoadingReplies, isFetching: isFetchingReplies } =
    useGetCommentRepliesQuery(
      { id: comment.id },
      {
        skip: !showReplies,
        selectFromResult: ({ data, isLoading, isFetching }) => {
          const repliesArr = (data as { items: CommentDto[] })?.items || []
          return {
            data: [...repliesArr].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            ),
            isLoading,
            isFetching
          }
        }
      }
    )

  const handleStartEditing = () => {
    setEditingCommentId(comment.id)
    setEditingContent(comment.content)
    setReplyingToCommentId(null)
  }

  const handleEditSubmit = () => {
    actions.onUpdateComment(comment.id, editingContent)
    setEditingCommentId(null)
  }

  const handleDelete = (id: string, isReply: boolean) => {
    actions.onDeleteComment(id); 
    const message = isReply ? 'Reply deleted' : 'Comment deleted';
    toast.success(message);
  };

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return
    actions.onAddComment(replyContent, comment.id)
    setReplyingToCommentId(null)
    setReplyContent("")
  }

  const authorName =
    comment.author.firstName && comment.author.lastName
      ? `${comment.author.firstName} ${comment.author.lastName}`
      : comment.author.username || comment.author.email

  const isAuthor = isLoggedIn && comment.meme.id === actions.memeId

  const contentClasses = isReply ? "text-sm text-gray-700 mt-1" : "text-base text-gray-700 mt-1"

  return (
    <div className={`flex flex-col ${isReply ? 'pl-8 relative' : 'mt-2'}`}>
      {isReply && <div className="absolute top-0 left-4 w-[2px] h-full bg-gray-300 rounded-full"></div>}

      <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm relative z-10">
        <div className="flex items-center gap-2">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-xs bg-gray-300">
              {comment.author.firstName?.[0] || <User className="w-4 h-4 text-gray-600" />}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm font-semibold text-gray-800">{authorName}</p>
        </div>

        {editingCommentId === comment.id ? (
          <div className="flex gap-2 items-start mt-1 pl-9">
            <Input value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="flex-grow" />
            <Button onClick={handleEditSubmit} disabled={!editingContent.trim()} size="sm">Save</Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingCommentId(null)}>Cancel</Button>
          </div>
        ) : (
          <p className={contentClasses + " pl-9"}>{comment.content}</p>
        )}

        <div className="flex gap-4 text-xs mt-1 pl-9">
          <Button
            variant="link"
            size="sm"
            className="text-gray-500 hover:text-blue-500 p-0 h-auto"
            onClick={() => {
              setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)
              setEditingCommentId(null)
            }}
          >
            <CornerDownRight className="w-3 h-3 mr-1" />
            Reply
          </Button>

          {isLoggedIn && isAuthor && (
            <>
              <Button
                variant="link"
                size="sm"
                className="text-gray-500 hover:text-yellow-600 p-0 h-auto"
                onClick={handleStartEditing}
                disabled={editingCommentId === comment.id}
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>

              <Button
                variant="link"
                size="sm"
                className="text-gray-500 hover:text-red-500 p-0 h-auto"
                onClick={() => handleDelete(comment.id, isReply)}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </>
          )}
        </div>

        {replyingToCommentId === comment.id && isLoggedIn && (
          <div className="flex gap-2 items-start mt-2 pl-9">
            <Input
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleReplySubmit} disabled={!replyContent.trim()} size="sm">
              Reply
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col mt-2">
        {comment.replyCount > 0 && !showReplies && (
          <Button
            variant="link"
            size="sm"
            className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto self-start pl-11"
            onClick={() => setShowReplies(true)}
            disabled={isLoadingReplies || isFetchingReplies}
          >
            {isLoadingReplies || isFetchingReplies ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              `View ${comment.replyCount} Replies`
            )}
          </Button>
        )}

        {(isLoadingReplies || isFetchingReplies) && showReplies && (
          <div className="flex items-center justify-start gap-2 mt-2 pl-11 text-gray-500 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading replies...
          </div>
        )}

        {showReplies &&
          directReplies.map((reply: CommentDto) => (
            <CommentItem key={reply.id} comment={reply} isLoggedIn={isLoggedIn} actions={actions} isReply={true} />
          ))}

        {showReplies && directReplies.length > 0 && (
          <Button
            variant="link"
            size="sm"
            className="text-sm text-gray-600 hover:text-gray-800 p-0 h-auto self-start pl-11"
            onClick={() => setShowReplies(false)}
          >
            Hide Replies
          </Button>
        )}
      </div>
    </div>
  )
}

interface CommentsSectionProps {
  comments: CommentDto[]
  isLoggedIn: boolean
}

export default function CommentsSection({ comments, isLoggedIn }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [visibleCommentCount, setVisibleCommentCount] = useState(COMMENTS_PER_LOAD)

  const actions = useCommentActions() as CommentActions

  const rootComments = useMemo(() => {
    return comments
      .filter((c) => c.depth === 0 || !c.parentComment)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [comments])

  const commentsToDisplay = useMemo(() => {
    return rootComments.slice(0, visibleCommentCount)
  }, [rootComments, visibleCommentCount])

  const hasMoreComments = rootComments.length > visibleCommentCount

  const handleLoadMore = () => {
    setVisibleCommentCount((prev) => prev + COMMENTS_PER_LOAD)
  }

  const handleTopLevelSubmit = () => {
    if (!newComment.trim()) return
    actions.onAddComment(newComment)
    setNewComment("")
  }

  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full">
      <h3 className="font-bold text-2xl text-gray-800 border-b pb-3 mb-2">Comments ({comments.length})</h3>

      {isLoggedIn && (
        <div className="flex gap-2 mb-4 items-start">
          <Input
            placeholder="Add a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-grow"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newComment.trim()) handleTopLevelSubmit()
            }}
          />
          <Button onClick={handleTopLevelSubmit} disabled={!newComment.trim()}>
            <Send className="w-4 h-4 mr-2" />
            Post
          </Button>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-gray-500 text-base py-4">Be the first to comment!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {commentsToDisplay.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-lg border border-gray-100 flex flex-col p-4">
              <CommentItem comment={c} isLoggedIn={isLoggedIn} actions={actions} isReply={false} />
            </div>
          ))}

          {hasMoreComments && (
            <Button variant="outline" onClick={handleLoadMore} className="mt-2 w-full max-w-sm mx-auto">
              Load More Comments
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
