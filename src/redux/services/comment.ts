import { iLoveMemesApi } from ".";
import { TAG_COMMENT_REPLIES, TAG_GET_COMMENTS } from "@/contracts/iLoveMemesApiTags";
import { CommentDto, CommentEntity, DeleteCommentResponse, CommentSortOptions } from "@/utils/types/comment";
import { EntityState } from "@reduxjs/toolkit";
import { rootCommentsAdapter, repliesAdapter } from "../adapters/commentAdapters";

export const commentsApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({

    createComment: builder.mutation<CommentEntity & { parent?: CommentEntity }, { content: string; memeId: string; parentCommentId?: string }>({
      query: (body) => ({
        url: "/comments",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => {
        if (body.parentCommentId) return [{ type: TAG_COMMENT_REPLIES, id: body.parentCommentId }];
        return body.memeId ? [{ type: TAG_GET_COMMENTS, id: body.memeId }] : [];
      },
    }),
    
    updateComment: builder.mutation<
      CommentEntity, 
      { 
        id: string; 
        content: string; 
        parentId?: string; 
        memeId: string; 
      }
    >({
      query: ({ id, content }) => ({
        url: `/comments/${id}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: (result, error, { parentId, memeId }) => {
        const tagsToInvalidate = [];
        if (parentId) {
          tagsToInvalidate.push({ type: TAG_COMMENT_REPLIES, id: parentId });
        } 
        else {
          tagsToInvalidate.push({ type: TAG_GET_COMMENTS, id: memeId });
        }
        return tagsToInvalidate;
      },
    }),
   
   deleteComment: builder.mutation<
     DeleteCommentResponse, 
     { 
       id: string; 
       parentId?: string; 
       memeId: string; 
     }
   >({
     query: ({ id }) => ({
       url: `/comments/${id}`,
       method: "DELETE",
       responseHandler: async (res) => (res.status === 204 ? { success: true } : res.json()),
     }),
     invalidatesTags: (result, error, { parentId, memeId }) => {
       const tagsToInvalidate = [];
       if (parentId) {
         tagsToInvalidate.push({ type: TAG_COMMENT_REPLIES, id: parentId });
       } 
       else {
         tagsToInvalidate.push({ type: TAG_GET_COMMENTS, id: memeId });
       }
       return tagsToInvalidate;
     },
   }),

    getCommentById: builder.query<CommentEntity, { id: string }>({
      query: ({ id }) => `/comments/${id}`,
      providesTags: (result, error, { id }) => [{ type: TAG_COMMENT_REPLIES, id }],
    }),

    getCommentsByMeme: builder.query<
        EntityState<CommentEntity, string>,
        { slugOrId: string; page?: number; limit?: number; sortOptions?: CommentSortOptions }
      >({
        query: ({ slugOrId, page = 1, limit: requestedLimit = 20, sortOptions = 'newest' }) => {
          const finalLimit = Math.min(requestedLimit, 120);
          return `/comments/memes/${slugOrId}?page=${page}&limit=${finalLimit}&sortOptions=${sortOptions}`;
        },
        transformResponse: (response: { items: CommentEntity[] }) => {
          const comments: CommentEntity[] = (response.items ?? []).map((c) => ({
            ...c,
            parentId: null,
            replyIds: [],
            loadedPages: 1,
            hasMoreReplies: c.replyCount > 0,
          }));
          return rootCommentsAdapter.setAll(
            rootCommentsAdapter.getInitialState(),
            comments,
          );
        },
        providesTags: (result, error, { slugOrId }) => [
          { type: TAG_GET_COMMENTS, id: slugOrId },
        ],
    }),
    
    getCommentReplies: builder.query<
      EntityState<CommentEntity, string>,
      { parentCommentId: string; page?: number; limit?: number }
    >({
      query: ({ parentCommentId, page = 1, limit }) =>
        `/comments/${parentCommentId}/replies?page=${page}&limit=${limit}`,
      transformResponse: (response: { items: CommentEntity[] }, meta, { parentCommentId }) => {
        const replies = (response.items ?? []).map((r) => ({
          ...r,
          parentId: parentCommentId,
          replyIds: [],
          loadedPages: 1,
          hasMoreReplies: r.replyCount > 0,
        }));
        return repliesAdapter.setAll(repliesAdapter.getInitialState(), replies);
      },
      serializeQueryArgs: ({ queryArgs }) =>
        `${queryArgs.parentCommentId}-${queryArgs.page}-${queryArgs.limit}`,   
      merge: (currentCache, newItems) => {
        repliesAdapter.setMany(currentCache, newItems.entities);
        currentCache.ids = [...currentCache.ids, ...newItems.ids];
      },
      providesTags: (result, error, { parentCommentId }) => [
        { type: TAG_COMMENT_REPLIES, id: parentCommentId },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useGetCommentByIdQuery,
  useGetCommentsByMemeQuery,
  useGetCommentRepliesQuery,
} = commentsApi;
