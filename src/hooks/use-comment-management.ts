import { useTypedSelector } from "@/redux/store";
import useAuthentication from "./use-authentication";
import { CommentEntity, NestedComment } from "@/utils/types/comment";
import { selectReplyEntities, selectCommentRepliesNested } from "@/redux/selectors/commentSelectors";

export const useCommentManagement = (memeId?: string) => {
  const { user } = useAuthentication();

  const allReplies = useTypedSelector(selectReplyEntities);

  const selectNested = useTypedSelector((state) => {
    return Object.fromEntries(
      Object.keys(allReplies).map((id) => [
        id,
        selectCommentRepliesNested(id)(state),
      ])
    );
  });

  const rootComments: CommentEntity[] = useTypedSelector((state) => {
    return Object.values(allReplies)
      .filter((c) => !c.parentId && (!memeId || c.meme.id === memeId))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  const allComments: CommentEntity[] = useTypedSelector((state) =>
    Object.values(allReplies)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  );

  const getReplies = (parentCommentId: string): NestedComment[] => {
    return selectNested[parentCommentId] || [];
  };

  const getComment = (commentId: string): CommentEntity | undefined => {
    return allReplies[commentId];
  };

  const canEdit = (commentAuthorId: string): boolean => user?.id === commentAuthorId;

  const canDelete = (commentAuthorId: string): boolean => user?.id === commentAuthorId;

  const isOwner = (comment: CommentEntity): boolean => comment.author.id === user?.id;

  const getCommentTreeForDeletion = (commentId: string): string[] => {
    const result: string[] = [];
    const traverse = (id: string) => {
      result.push(id);
      const replies = allComments.filter((c) => c.parentId === id);
      replies.forEach((r) => traverse(r.id));
    };
    traverse(commentId);
    return result;
  };

  const getCommentCount = (): number => allComments.length;

  const getRootCommentCount = (): number => rootComments.length;

  const getReplyCount = (parentCommentId: string): number => getReplies(parentCommentId).length;

  return {
    rootComments,
    allComments,
    getReplies,
    getComment,
    canEdit,
    canDelete,
    isOwner,
    getCommentTreeForDeletion,
    getCommentCount,
    getRootCommentCount,
    getReplyCount,
    currentUserId: user?.id,
  };
};
