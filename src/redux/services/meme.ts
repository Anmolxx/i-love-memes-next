import { iLoveMemesApi } from ".";
import { TAG_GET_MEMES, TAG_GET_DELETED_MEMES } from "@/contracts/iLoveMemesApiTags";
import { GetMemesArgs, GetMemesResponse, DeleteMemeArgs, DeleteMemeResponse, EmptyResponse, MemeMutationArg} from "@/utils/dtos/meme.dto";
import { Meme } from "@/utils/dtos/meme.dto";

export const memesApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getMemes: builder.query<
      GetMemesResponse,
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
          orderBy,
          templateIds,
          reported,
          interactionType, 
          reasons,  
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
        if (templateIds && templateIds.length > 0) {
          templateIds.forEach(t => queryParams.append("templateIds", t));
        }
        if (reported !== undefined) {
          queryParams.set("reported", String(reported));
        }
        if (interactionType) {
          queryParams.set("interactionType", interactionType);
        }
        if (reasons) {
          queryParams.set("reasons", reasons);
        }
        return { 
          url: `/memes?${queryParams.toString()}`, 
          method: "GET" 
        };
      },
    }),
    
    getMemeBySlugOrId: builder.query<{data: Meme}, string>({
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

    deleteMeme: builder.mutation<DeleteMemeResponse, DeleteMemeArgs>({
      invalidatesTags:[TAG_GET_MEMES, TAG_GET_DELETED_MEMES],
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

    getDeletedMemes: builder.query<
        GetMemesResponse,
        GetMemesArgs
      >({
        providesTags: [TAG_GET_DELETED_MEMES],
        query: (params = {}) => {
          const { 
            page = 1, 
            limit = 10,
            search, 
            tags, 
            order, 
            orderBy,
            reported,
            interactionType, 
            reasons,  
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
          if (reported !== undefined) {
            queryParams.set("reported", String(reported));
          }
          if (interactionType) {
            queryParams.set("interactionType", interactionType);
          }
          if (reasons) {
            queryParams.set("reason", reasons);
          }
          return { 
            url: `/memes/deleted?${queryParams.toString()}`, 
            method: "GET" 
          };
        },
      }),

      restoreMeme: builder.mutation<EmptyResponse, MemeMutationArg>({
        query: (slugOrId) => ({
          url: `/memes/${slugOrId}/restore`,
          method: "PATCH",
        }),
        invalidatesTags: [TAG_GET_MEMES, TAG_GET_DELETED_MEMES], 
      }),

      permanentDeleteMeme: builder.mutation<EmptyResponse, MemeMutationArg>({
        query: (slugOrId) => ({
          url: `/memes/${slugOrId}/permanent`,
          method: "DELETE", 
        }),
        invalidatesTags: [TAG_GET_DELETED_MEMES], 
      }),
  }),
  overrideExisting: true
});

export const { useGetMemesQuery, useGetMemeBySlugOrIdQuery, usePostMemeMutation, useDeleteMemeMutation,useUpdateMemeMutation, useGetDeletedMemesQuery, useRestoreMemeMutation, usePermanentDeleteMemeMutation, } = memesApi;
