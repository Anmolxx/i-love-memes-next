import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { CommentEntity } from '@/utils/types/comment';

export const rootCommentsAdapter = createEntityAdapter<CommentEntity, string>({
  selectId: (comment: CommentEntity) => comment.id,
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt), 
});

export const repliesAdapter = createEntityAdapter<CommentEntity, string>({
  selectId: (comment: CommentEntity) => comment.id,
});

export type RootCommentsState = EntityState<CommentEntity, string> & {
  currentPage: number;
  totalPages: number;
};

export type RepliesState = EntityState<CommentEntity, string>;
