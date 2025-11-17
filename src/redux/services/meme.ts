import { iLoveMemesApi } from ".";
import { TAG_GET_MEMES } from "@/contracts/iLoveMemesApiTags";

export type MemeOrderBy = 
  | "createdAt"
  | "updatedAt"
  | "title"
  | "upvotes"
  | "downvotes"
  | "reports"
  | "trending"
  | "score";

export type SortOrder = "ASC" | "DESC";

export interface GetMemesArgs {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  order?: SortOrder;
  orderBy?: MemeOrderBy;
}

export const memesApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getMemes: builder.query<
      any,
      GetMemesArgs
    >({
      providesTags: [TAG_GET_MEMES],
      query: (params = {}) => {
        const { 
          page = 1, 
          limit = 10,
          search, 
          tags, 
          order, 
          orderBy 
        } = params;
    
        const queryParams = new URLSearchParams();
    
        const finalPage = Math.max(1, Math.floor(page));
        queryParams.set("page", String(finalPage));
    
        const MAX_LIMIT = 50;
        const finalLimit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)));
        queryParams.set("limit", String(finalLimit));
    
        if (search && search.trim().length > 0) {
          queryParams.set("search", search.trim());
        }
    
        if (tags && tags.length > 0) {
          tags.forEach(t => queryParams.append("tags", t));
        }
    
        if (orderBy) {
          queryParams.set("orderBy", orderBy);
        }
        if (order) {
          queryParams.set("order", order);
        }
        return { 
          url: `/memes?${queryParams.toString()}`, 
          method: "GET" 
        };
      },
    }),
    
    getMemeBySlugOrId: builder.query<any, string>({
      providesTags: [TAG_GET_MEMES],
        query: (slugOrId) => ({
          url: `/memes/${slugOrId}`,
          method: "GET",
        }),
      }),

    postMeme: builder.mutation<any, any>({
      query: (body) => ({
        url: "/memes",
        method: "POST",
        body,
      }),
    }),

    deleteMeme: builder.mutation<any, string>({
      invalidatesTags:[TAG_GET_MEMES],
      query: (slugOrId) => ({
        url: `/memes/${slugOrId}`,
        method: "DELETE",
      }),
    }),

    updateMeme: builder.mutation<any, { slugOrId: string; body: Partial<any> }>({
      invalidatesTags:[TAG_GET_MEMES],
        query: ({ slugOrId, body }) => ({
          url: `/memes/${slugOrId}`,
          method: "PATCH",
          body,
        }),
    }),
  }),
  overrideExisting: true
});

export const { useGetMemesQuery, useGetMemeBySlugOrIdQuery, usePostMemeMutation, useDeleteMemeMutation,useUpdateMemeMutation } = memesApi;
