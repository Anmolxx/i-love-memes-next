import { iLoveMemesApi } from ".";
import { TAGS_API } from "@/contracts/iLoveMemesApiTags";
export const tagsApi = iLoveMemesApi.injectEndpoints({
    endpoints: (builder) => ({

        //GET all Tags
        getAllTags: builder.query<any, void>({
          query: () => ({
            url: "/tags",
            method: "GET",
          }),
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