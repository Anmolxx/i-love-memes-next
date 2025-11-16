import { iLoveMemesApi } from ".";
import { TAGS_API } from "@/contracts/iLoveMemesApiTags";
export const tagsApi = iLoveMemesApi.injectEndpoints({
    endpoints: (builder) => ({

        //GET all Tags
        getAllTags: builder.query<any, { search?: string; page?: number; limit?: number } | void>({
          query: (params) => {
            const searchParam = params?.search ? `search=${encodeURIComponent(params.search)}` : "";
            const pageParam = params?.page ? `page=${params.page}` : "";
            const limitParam = params?.limit ? `limit=${params.limit}` : "";
            const queryString = [searchParam, pageParam, limitParam].filter(Boolean).join("&");
            const url = queryString ? `/tags?${queryString}` : `/tags`;
        
            return {
              url,
              method: "GET",
            };
          },
          providesTags: [TAGS_API],
        }),

        //POST Tags
        createTag: builder.mutation<any, { name: string }>({
            query: (body) => ({
              url: "/tags",
              method: "POST",
              body,
            }),
            invalidatesTags: [TAGS_API],
          }),
      }),
      overrideExisting: false,
    });
    
export const { useGetAllTagsQuery, useCreateTagMutation } = tagsApi;