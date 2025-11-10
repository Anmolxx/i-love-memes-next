import { iLoveMemesApi } from ".";

export const communityApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getCommunityMemes: builder.query<any, { page?: number; per_page?: number } | void>({
      query: (params) => {
        if (!params) return { url: `/memes`, method: "GET" };
        const { page = 1, per_page = 20 } = params as { page?: number; per_page?: number };
        return { url: `/memes?page=${page}&limit=${per_page}`, method: "GET" };
      },
    }),

    postMeme: builder.mutation<any, any>({
      query: (body) => ({
        url: "/memes",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetCommunityMemesQuery, usePostMemeMutation } = communityApi;
