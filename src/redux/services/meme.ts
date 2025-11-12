import { iLoveMemesApi } from ".";
import { COMMUNITY_MEMES } from "@/contracts/iLoveMemesApiTags";
export const communityApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getMemes: builder.query<any, { page?: number; per_page?: number; search?: string } | void>({
      query: (params) => {
        const { page = 1, per_page = 20, search } = params || {};
        let url = `/memes?page=${page}&limit=${per_page}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        return { url, method: "GET" };
      },
    }),

    getMemeBySlugOrId: builder.query<any, string>({
        query: (slugOrId) => ({
          url: `/memes/${slugOrId}`,
          method: "GET",
        }),
        providesTags: [COMMUNITY_MEMES],
      }),

    postMeme: builder.mutation<any, any>({
      query: (body) => ({
        url: "/memes",
        method: "POST",
        body,
      }),
    }),

    deleteMeme: builder.mutation<any, string>({
      query: (slugOrId) => ({
        url: `/memes/${slugOrId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: COMMUNITY_MEMES, id: "LIST" }],
    }),
  }),
});

export const { useGetMemesQuery, useGetMemeBySlugOrIdQuery, usePostMemeMutation, useDeleteMemeMutation, } = communityApi;
