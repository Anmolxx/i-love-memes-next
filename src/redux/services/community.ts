import { iLoveMemesApi } from ".";
import { COMMUNITY_MEMES } from "@/contracts/iLoveMemesApiTags";
export const communityApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getCommunityMemes: builder.query<any, { page?: number; per_page?: number; search?: string } | void>({
      query: (params) => {
        const { page = 1, per_page = 20, search } = params || {};
        let url = `/memes?page=${page}&limit=${per_page}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        return { url, method: "GET" };
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
