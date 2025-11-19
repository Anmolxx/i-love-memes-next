import { iLoveMemesApi } from ".";
import {
  InteractionSummary,
  PostInteractionBody,
} from "@/types/meme-types";
import { TAG_GET_MEMES, TAG_MEME_INTERACTION_SUMMARY } from "@/contracts/iLoveMemesApiTags"; 

export const memeInteractionsApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({

    postInteraction: builder.mutation<any, PostInteractionBody>({
      query: (body) => ({
        url: "/interactions",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { memeId }) => [
        { type: TAG_MEME_INTERACTION_SUMMARY, id: memeId },
        TAG_GET_MEMES
      ],
    }),

    getInteractionSummary: builder.query<
      InteractionSummary,
      { memeId: string; userId: string }
    >({
      query: ({ memeId, userId }) => ({
        url: `/interactions/memes/${memeId}/summary?userId=${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, { memeId }) => [
        { type: TAG_MEME_INTERACTION_SUMMARY, id: memeId }
      ],
    }),

    deleteInteraction: builder.mutation<
      any,
      { memeId: string; type: 'UPVOTE' | 'DOWNVOTE' }
    >({
      query: ({ memeId, type }) => ({
        url: `/interactions/memes/${memeId}?type=${type}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { memeId }) => [
        { type: TAG_MEME_INTERACTION_SUMMARY, id: memeId },
        TAG_GET_MEMES
      ],
    }),
  }),
});

export const {
  usePostInteractionMutation,
  useGetInteractionSummaryQuery,
  useDeleteInteractionMutation,
} = memeInteractionsApi;