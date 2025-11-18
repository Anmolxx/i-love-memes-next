import { iLoveMemesApi } from ".";
import { TAG_GET_COMMENTS } from "@/contracts/iLoveMemesApiTags";

export const commentsApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
    createComment: builder.mutation<any, { content: string; memeId: string; parentCommentId?: string }>({
      query: (body) => ({
        url: "/comments",
        method: "POST",
        body,
      }),
    }),

    updateComment: builder.mutation<any, { id: string; content: string }>({
      query: ({ id, content }) => ({
        url: `/comments/${id}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: [TAG_GET_COMMENTS],
    }),

    deleteComment: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/comments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_GET_COMMENTS],
    }),

    getCommentById: builder.query<any, { id: string }>({
      query: ({ id }) => `/comments/${id}`,
      providesTags: [TAG_GET_COMMENTS],
    }),

    getCommentsByMeme: builder.query<any, { slugOrId: string }>({
      query: ({ slugOrId }) => `/comments/memes/${slugOrId}`,
      providesTags: [TAG_GET_COMMENTS],
    }),

    getCommentReplies: builder.query<any, { id: string }>({
      query: ({ id }) => `/comments/${id}/replies`,
      providesTags: [TAG_GET_COMMENTS],
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
