// import React, { useState, useMemo, useEffect } from 'react'
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { CommentDto } from "@/utils/dtos/comment.dto"
// import { Edit, Trash2, Send, CornerDownRight, User, Loader2 } from "lucide-react"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { useGetCommentRepliesQuery, useCreateCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from "@/redux/services/comment"
// import { toast } from 'sonner'
// import { useCommentManagement } from "@/hooks/use-comment-management"
// import { useAppDispatch } from "@/redux/store"
// import { setCommentsByMeme } from "@/redux/slices/comment.slice"

// const COMMENTS_PER_LOAD = 5

// interface CommentItemProps {
//   comment: CommentDto
//   isLoggedIn: boolean
//   onDelete: (id: string) => Promise<void>
//   onUpdate: (id: string, content: string) => Promise<void>
//   onReply: (content: string, parentId: string) => Promise<void>
//   onToggleReplies: (id: string, show: boolean) => void
//   showingReplies: Set<string>
// }

// const handleApiError = (err: any) => {
//   const apiError = err?.data
//   if (apiError?.errors && typeof apiError.errors === "object") {
//     Object.values(apiError.errors).forEach((msg: any) => { if (typeof msg === "string") toast.error(msg) })
//   } else if (apiError?.message) toast.error(apiError.message)
//   else toast.error("Failed to perform action")
// }

// const CommentItem: React.FC<CommentItemProps> = ({ 
//   comment, 
//   isLoggedIn, 
//   onDelete, 
//   onUpdate,
//   onReply,
//   onToggleReplies,
//   showingReplies
// }) => {
//   const { currentUserId } = useCommentManagement()
//   const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
//   const [editingContent, setEditingContent] = useState(comment.content)
//   const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null)
//   const [replyContent, setReplyContent] = useState("")
//   const isShowing = showingReplies.has(comment.id)

//   const { data: directReplies = [], isLoading: isLoadingReplies, isFetching: isFetchingReplies } =
//     useGetCommentRepliesQuery(
//       { id: comment.id },
//       {
//         skip: !isShowing,
//         selectFromResult: ({ data, isLoading, isFetching }) => {
//           const repliesArr = (data as { items: CommentDto[] })?.items || []
//           return {
//             data: [...repliesArr].sort(
//               (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
//             ),
//             isLoading,
//             isFetching
//           }
//         }
//       }
//     )

//   const handleStartEditing = () => {
//     setEditingCommentId(comment.id)
//     setEditingContent(comment.content)
//     setReplyingToCommentId(null)
//   }

//   const handleEditSubmit = async () => {
//     if (!editingContent.trim()) return
//     try {
//       await onUpdate(comment.id, editingContent)
//       setEditingCommentId(null)
//     } catch (err: any) {
//       handleApiError(err)
//     }
//   }

//   const handleDelete = async () => {
//     try {
//       await onDelete(comment.id)
//     } catch (err: any) {
//       handleApiError(err)
//     }
//   }

//   const handleReplySubmit = async () => {
//     if (!replyContent.trim()) return
//     try {
//       await onReply(replyContent, comment.id)
//       setReplyingToCommentId(null)
//       setReplyContent("")
//     } catch (err: any) {
//       handleApiError(err)
//     }
//   }

//   const authorName =
//     comment.author.firstName && comment.author.lastName
//       ? `${comment.author.firstName} ${comment.author.lastName}`
//       : comment.author.username || comment.author.email

//   const isOwner = currentUserId === comment.author.id

//   return (
//     <div className={`flex flex-col ${comment.depth > 0 ? 'pl-8 relative' : 'mt-2'}`}>
//       {comment.depth > 0 && <div className="absolute top-0 left-4 w-[2px] h-full bg-gray-300 rounded-full"></div>}

//       <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm relative z-10">
//         <div className="flex items-center gap-2">
//           <Avatar className="w-7 h-7">
//             <AvatarFallback className="text-xs bg-gray-300">
//               {comment.author.firstName?.[0] || <User className="w-4 h-4 text-gray-600" />}
//             </AvatarFallback>
//           </Avatar>
//           <p className="text-sm font-semibold text-gray-800">{authorName}</p>
//         </div>

//         {editingCommentId === comment.id ? (
//           <div className="flex gap-2 items-start mt-1 pl-9">
//             <Input 
//               value={editingContent} 
//               onChange={(e) => setEditingContent(e.target.value)} 
//               className="flex-grow" 
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && editingContent.trim()) handleEditSubmit()
//               }}
//             />
//             <Button className="cursor-pointer" onClick={handleEditSubmit} disabled={!editingContent.trim()} size="sm">
//               Save
//             </Button>
//             <Button variant="ghost" size="sm" onClick={() => setEditingCommentId(null)}>
//               Cancel
//             </Button>
//           </div>
//         ) : (
//           <p className={`text-base text-gray-700 mt-1 pl-9`}>
//             {comment.content}
//           </p>
//         )}

//         <div className="flex gap-4 text-xs mt-1 pl-9">
//           <Button
//             variant="link"
//             size="sm"
//             className="text-gray-500 hover:text-blue-500 p-0 h-auto cursor-pointer"
//             onClick={() => {
//               setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)
//               setEditingCommentId(null)
//             }}
//           >
//             <CornerDownRight className="w-3 h-3 mr-1" />
//             Reply
//           </Button>

//           {isLoggedIn && isOwner && (
//             <Button
//               variant="link"
//               size="sm"
//               className="text-gray-500 hover:text-yellow-600 p-0 h-auto cursor-pointer"
//               onClick={handleStartEditing}
//               disabled={editingCommentId === comment.id}
//             >
//               <Edit className="w-3 h-3 mr-1" />
//               Edit
//             </Button>
//           )}

//           {isLoggedIn && isOwner && (
//             <Button
//               variant="link"
//               size="sm"
//               className="text-gray-500 hover:text-red-500 p-0 h-auto cursor-pointer"
//               onClick={handleDelete}
//             >
//               <Trash2 className="w-3 h-3 mr-1" />
//               Delete
//             </Button>
//           )}
//         </div>

//         {replyingToCommentId === comment.id && isLoggedIn && (
//           <div className="flex gap-2 items-start mt-2 pl-9">
//             <Input
//               placeholder="Write a reply..."
//               value={replyContent}
//               onChange={(e) => setReplyContent(e.target.value)}
//               className="flex-grow"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && replyContent.trim()) handleReplySubmit()
//               }}
//             />
//             <Button 
//               className="cursor-pointer" 
//               onClick={handleReplySubmit} 
//               disabled={!replyContent.trim()} 
//               size="sm"
//             >
//               Reply
//             </Button>
//           </div>
//         )}
//       </div>

//       <div className="flex flex-col mt-2">
//         {comment.replyCount > 0 && !isShowing && (
//           <Button
//             variant="link"
//             size="sm"
//             className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto self-start pl-11"
//             onClick={() => onToggleReplies(comment.id, true)}
//             disabled={isLoadingReplies || isFetchingReplies}
//           >
//             {isLoadingReplies || isFetchingReplies ? (
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             ) : (
//               `View ${comment.replyCount} Replies`
//             )}
//           </Button>
//         )}

//         {(isLoadingReplies || isFetchingReplies) && isShowing && (
//           <div className="flex items-center justify-start gap-2 mt-2 pl-11 text-gray-500 text-sm">
//             <Loader2 className="h-4 w-4 animate-spin" /> Loading replies...
//           </div>
//         )}

//         {isShowing && directReplies.length > 0 && (
//           <>
//             {directReplies.map((reply: CommentDto) => (
//               <CommentItem 
//                 key={reply.id} 
//                 comment={reply} 
//                 isLoggedIn={isLoggedIn} 
//                 onDelete={onDelete}
//                 onUpdate={onUpdate}
//                 onReply={onReply}
//                 onToggleReplies={onToggleReplies}
//                 showingReplies={showingReplies}
//               />
//             ))}
//           </>
//         )}

//         {isShowing && directReplies.length > 0 && (
//           <Button
//             variant="link"
//             size="sm"
//             className="text-sm text-gray-600 hover:text-gray-800 p-0 h-auto self-start pl-11"
//             onClick={() => onToggleReplies(comment.id, false)}
//           >
//             Hide Replies
//           </Button>
//         )}
//       </div>
//     </div>
//   )
// }

// interface CommentsSectionProps {
//   comments: CommentDto[]
//   isLoggedIn: boolean
//   memeIdentifier: string;
// }

// export default function CommentsSection({ comments, isLoggedIn, memeIdentifier }: CommentsSectionProps) {
//   const [newComment, setNewComment] = useState("")
//   const [visibleCommentCount, setVisibleCommentCount] = useState(COMMENTS_PER_LOAD)
//   const [showingReplies, setShowingReplies] = useState(new Set<string>())
//   const MEME_ID = memeIdentifier; 

//   const dispatch = useAppDispatch()
//   const { rootComments } = useCommentManagement()
  
//   const [createCommentApi] = useCreateCommentMutation()
//   const [updateCommentApi] = useUpdateCommentMutation()
//   const [deleteCommentApi] = useDeleteCommentMutation()

//   useEffect(() => {
//     if (comments && comments.length > 0) {
//       dispatch(setCommentsByMeme({ memeId: MEME_ID, comments }))
//     }
//   }, [comments, dispatch, MEME_ID])

//   const rootCommentsData = useMemo(() => {
//     return rootComments.slice(0, visibleCommentCount)
//   }, [rootComments, visibleCommentCount])

//   const hasMoreComments = rootComments.length > visibleCommentCount

//   const handleLoadMore = () => {
//     setVisibleCommentCount((prev) => prev + COMMENTS_PER_LOAD)
//   }

//   const handleToggleReplies = (commentId: string, show: boolean) => {
//     const newSet = new Set(showingReplies)
//     if (show) newSet.add(commentId)
//     else newSet.delete(commentId)
//     setShowingReplies(newSet)
//   }

//   const handleTopLevelSubmit = async () => {
//     if (!newComment.trim()) return
//     try {
//       await createCommentApi({ content: newComment, memeId: MEME_ID }).unwrap()
//       setNewComment("")
//       toast.success('Comment added successfully')
//     } catch (err: any) {
//       handleApiError(err)
//     }
//   }

//   const handleDelete = async (commentId: string) => {
//     try {
//       await deleteCommentApi({ id: commentId, memeSlugOrId: MEME_ID }).unwrap()
//       toast.success('Comment deleted successfully')
//     } catch (err: any) {
//       handleApiError(err)
//     }
//   }

//   const handleUpdate = async (commentId: string, content: string) => {
//     try {
//       await updateCommentApi({ id: commentId, content }).unwrap()
//       toast.success('Comment updated successfully')
//     } catch (err: any) {
//       handleApiError(err)
//     }
//   }

//   const handleReply = async (content: string, parentCommentId: string) => {
//     try {
//       await createCommentApi({ content, memeId: MEME_ID, parentCommentId }).unwrap()
//       toast.success('Reply added successfully')
//     } catch (err: any) {
//       handleApiError(err)
//     }
//   }

//   return (
//     <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full h-full">
//       <div className="flex-1 overflow-auto pr-2 pb-2">
//         {rootComments.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-6">
//               <svg xmlns="http://www.w3.org/2000/svg" className="w-28 h-28 mb-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <circle cx="12" cy="12" r="10" strokeWidth="1.5" className="text-yellow-300" />
//                 <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                 <path d="M9 9h.01M15 9h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//               <h4 className="text-lg font-semibold mb-2">No one has roasted this meme... yet</h4>
//               <p className="text-sm text-gray-500 max-w-xs">
//                 Looks like the audience is speechless. Be the first to drop a witty comment — fame awaits.
//               </p>
//           </div>
//         ) : (
//           <div className="flex flex-col gap-4">
//             {rootCommentsData.map((comment: CommentDto) => (
//               <div key={comment.id} className="bg-gray-50 rounded-lg border border-gray-100 flex flex-col p-4">
//                 <CommentItem 
//                   comment={comment} 
//                   isLoggedIn={isLoggedIn} 
//                   onDelete={handleDelete}
//                   onUpdate={handleUpdate}
//                   onReply={handleReply}
//                   onToggleReplies={handleToggleReplies}
//                   showingReplies={showingReplies}
//                 />
//               </div>
//             ))}

//             {hasMoreComments && (
//               <div className="flex justify-center mt-2">
//                 <Button variant="outline" onClick={handleLoadMore} className="w-full max-w-sm">
//                   Load More Comments
//                 </Button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       <div className="mt-4 border-t pt-4">
//         <div className="flex items-center justify-between mb-3">
//           <h3 className="font-bold text-lg text-gray-800">Comments ({rootComments.length})</h3>
//         </div>

//         {isLoggedIn ? (
//           <div className="flex gap-2 items-start">
//             <Input
//               placeholder="Add a comment"
//               value={newComment}
//               onChange={(e) => setNewComment(e.target.value)}
//               className="flex-grow"
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter' && newComment.trim()) handleTopLevelSubmit()
//               }}
//             />
//             <Button 
//               className="cursor-pointer" 
//               onClick={handleTopLevelSubmit} 
//               disabled={!newComment.trim()}
//             >
//               <Send className="w-4 h-4 mr-2" />
//               Post
//             </Button>
//           </div>
//         ) : (
//           <div className="text-sm text-gray-500">Please sign in to comment.</div>
//         )}
//       </div>
//     </div>
//   )
// }
