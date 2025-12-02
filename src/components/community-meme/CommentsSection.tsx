import React, { useState, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CommentDto } from "@/utils/dtos/comment.dto"
import { useCommentActions } from "@/context/CommentActions"
import { Edit, Trash2, Send, CornerDownRight, User, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useGetCommentRepliesQuery } from "@/redux/services/comment"
import { toast } from 'sonner'
import useAuthentication from "@/hooks/use-authentication";

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

const handleApiError = (err: any) => {
  const apiError = err?.data
  if (apiError?.errors && typeof apiError.errors === "object") {
    Object.values(apiError.errors).forEach((msg: any) => { if (typeof msg === "string") toast.error(msg) })
  } else if (apiError?.message) toast.error(apiError.message)
  else toast.error("Failed to update user")
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

  const handleEditSubmit = async () => {
    try {
      await actions.onUpdateComment(comment.id, editingContent)
      setEditingCommentId(null)
    } catch (err: any) {
      handleApiError(err)
    }
  }

  const handleDelete = async (id: string, isReply: boolean) => {
    try {
      await actions.onDeleteComment(id)
      const message = isReply ? 'Reply deleted' : 'Comment deleted'
      toast.success(message)
    } catch (err: any) {
      handleApiError(err)
    }
  }

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return
    try {
      await actions.onAddComment(replyContent, comment.id)
      setReplyingToCommentId(null)
      setReplyContent("")
    } catch (err: any) {
      handleApiError(err)
    }
  }

  const authorName =
    comment.author.firstName && comment.author.lastName
      ? `${comment.author.firstName} ${comment.author.lastName}`
      : comment.author.username || comment.author.email

  const isAuthor = isLoggedIn && comment.author.id === actions.memeId

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
            <Input value={editingContent} 
            onChange={(e) => setEditingContent(e.target.value)} className="flex-grow" 
            onKeyDown={(e) => {
                if (e.key === "Enter" && editingContent.trim()) handleEditSubmit()
              }}/>
            <Button className="cursor-pointer" onClick={handleEditSubmit} 
            disabled={!editingContent.trim()} size="sm">Save</Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingCommentId(null)}>Cancel</Button>
          </div>
        ) : (
          <p className={contentClasses + " pl-9"}>{comment.content}</p>
        )}

        <div className="flex gap-4 text-xs mt-1 pl-9">
          <Button
            variant="link"
            size="sm"
            className="text-gray-500 hover:text-blue-500 p-0 h-auto cursor-pointer"
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
                className="text-gray-500 hover:text-yellow-600 p-0 h-auto cursor-pointer"
                onClick={handleStartEditing}
                disabled={editingCommentId === comment.id}
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>

              <Button
                variant="link"
                size="sm"
                className="text-gray-500 hover:text-red-500 p-0 h-auto cursor-pointer"
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
              onKeyDown={(e) => {
                  if (e.key === "Enter" && replyContent.trim()) handleReplySubmit()
                }}
            />
            <Button className="cursor-pointer" onClick={handleReplySubmit} disabled={!replyContent.trim()} size="sm">
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

  const handleTopLevelSubmit = async () => {
    if (!newComment.trim()) return
    try {
      await actions.onAddComment(newComment)
      setNewComment("")
    } catch (err: any) {
      handleApiError(err)
    }
  }

  return (
    <div className="flex flex-col bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full h-full">

      <div className="flex-1 overflow-auto pr-2 pb-2">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-6">
            
            <svg xmlns="http://www.w3.org/2000/svg" className="w-28 h-28 mb-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="1.5" className="text-yellow-300" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 9h.01M15 9h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h4 className="text-lg font-semibold mb-2">No one has roasted this meme... yet</h4>
            <p className="text-sm text-gray-500 max-w-xs">Looks like the audience is speechless. Be the first to drop a witty comment — fame awaits.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {commentsToDisplay.map((c) => (
              <div key={c.id} className="bg-gray-200 rounded-lg border border-gray-100 flex flex-col p-4">
                <CommentItem comment={c} isLoggedIn={isLoggedIn} actions={actions} isReply={false} />
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

      <div className="mt-4">
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
                if (e.key === 'Enter' && newComment.trim()) handleTopLevelSubmit()
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
  )
}