import { createSelector } from '@reduxjs/toolkit';
import { RootState, useTypedSelector } from '@/redux/store';
import { CommentEntity, NestedComment } from '@/utils/dtos/comment.dto';
import { repliesAdapter } from '../adapters/commentAdapters';

const selectRepliesState = (state: RootState) =>
  state.I_love_memes.queries?.getCommentReplies?.data;

export const selectReplyEntities = createSelector(selectRepliesState, (state) =>
  state ? repliesAdapter.getSelectors().selectEntities(state) : {}
);

export const buildNestedComment = (
  commentId: string,
  replyEntities: Record<string, CommentEntity>
): NestedComment | null => {
  const comment = replyEntities[commentId];
  if (!comment) return null;

  const replies = comment.replyIds
    .map((id) => buildNestedComment(id, replyEntities))
    .filter(Boolean) as NestedComment[];

  return { ...comment, replies };
};

export const selectCommentRepliesNested = (parentId: string) =>
  createSelector([selectReplyEntities], (entities) => {
    const parentReplies = Object.values(entities).filter((c) => c.parentId === parentId);
    return parentReplies
      .map((c) => buildNestedComment(c.id, entities))
      .filter((c): c is NestedComment => c !== null);
  });

export const useCommentRepliesNested = (parentId: string) => {
  return useTypedSelector(selectCommentRepliesNested(parentId));
};

const selectCommentsByMemeState = (state: RootState) =>
  state.I_love_memes.queries?.getCommentsByMeme?.data;

export const selectAllRootComments = (memeId: string) =>
  createSelector([selectCommentsByMemeState], (state) =>
    state
      ? Object.values(repliesAdapter.getSelectors().selectEntities(state)).filter(
          (c) => c && c.meme.id === memeId && !c.parentId
        )
      : []
  );

export const useAllRootComments = (memeId: string) => {
  return useTypedSelector(selectAllRootComments(memeId));
};
