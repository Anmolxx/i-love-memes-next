import { iLoveMemesApi } from ".";
import { TAG_COMMENT_REPLIES, TAG_GET_COMMENTS } from "@/contracts/iLoveMemesApiTags";

export const commentsApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
    createComment: builder.mutation<any, { content: string; memeId: string; parentCommentId?: string }>({
      query: (body) => ({
        url: "/comments",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => {
        const tags: any[] = [{ type: TAG_GET_COMMENTS }];
        if (body.parentCommentId) {
          tags.push({ type: TAG_COMMENT_REPLIES, id: body.parentCommentId });
        }
        return tags;
      },
    }),

    updateComment: builder.mutation<any, { id: string; content: string }>({
      query: ({ id, content }) => ({
        url: `/comments/${id}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: TAG_GET_COMMENTS },
        { type: TAG_COMMENT_REPLIES, id: id }
      ],
    }),

    deleteComment: builder.mutation<any, { id: string, parentCommentId?: string, memeSlugOrId?: string }>({
      query: ({ id }) => ({
        url: `/comments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { parentCommentId, memeSlugOrId }) => {
        const tags: any[] = [];
    
        // Invalidate main comments for meme
        if (memeSlugOrId) {
          tags.push({ type: TAG_GET_COMMENTS, id: memeSlugOrId });
        } else {
          tags.push({ type: TAG_GET_COMMENTS });
        }
    
        // ❗ ONLY invalidate the parent's replies
        if (parentCommentId) {
          tags.push({ type: TAG_COMMENT_REPLIES, id: parentCommentId });
        }
    
        return tags;
      },
    }),
    

    getCommentById: builder.query<any, { id: string }>({
      query: ({ id }) => `/comments/${id}`,
      providesTags: (result, error, { id }) => [{ type: TAG_COMMENT_REPLIES, id: id }],
    }),

    getCommentsByMeme: builder.query<any, { slugOrId: string }>({
      query: ({ slugOrId }) => `/comments/memes/${slugOrId}`,
      providesTags: (result, error, { slugOrId }) => [{ type: TAG_GET_COMMENTS, id: slugOrId }],
    }),

    getCommentReplies: builder.query<any, { id: string }>({
      query: ({ id }) => `/comments/${id}/replies`,
      providesTags: (result, error, { id }) => [{ type: TAG_COMMENT_REPLIES, id: id }],
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