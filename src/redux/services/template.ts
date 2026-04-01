import { TAG_GET_DELETED_TEMPLATES, TAG_GET_TEMPLATES_ADMIN } from "@/contracts/iLoveMemesApiTags";
import { iLoveMemesApi } from ".";
import { DeleteTemplateArgs, DeleteTemplateResponse, EmptyResponse, GetTemplatesArgs, GetTemplatesResponse, TemplateMutationArg } from "@/utils/types/template";
import { Template } from "@/utils/types/template";

export const templatesApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
   getTemplates: builder.query<GetTemplatesResponse, GetTemplatesArgs>({
    providesTags:[TAG_GET_TEMPLATES_ADMIN],
       query: (params = {}) => {
         const {
           page = 1,
           limit = 10,
           search,
           tags,
           orderBy,
           order,
         } = params ?? {};
   
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
           url: `/templates?${queryParams.toString()}`,
           method: "GET",
         };
       },
     }),

    saveAsTemplate: builder.mutation<any, any>({
      query: (body) => ({
        url: "/templates",
        method: "POST",
        body,
      }),
    }),

    deleteTemplate: builder.mutation<DeleteTemplateResponse, DeleteTemplateArgs>({
      invalidatesTags: [TAG_GET_TEMPLATES_ADMIN],
      query: (id) => ({
        url: `/templates/${id}`,
        method: "DELETE",
      }),
    }),

    updateTemplate: builder.mutation<any, { slugOrId: string; body: Partial<any> }>({
        invalidatesTags:[TAG_GET_TEMPLATES_ADMIN],
          query: ({ slugOrId, body }) => ({
            url: `/templates/${slugOrId}`,
            method: "PATCH",
            body,
          }),
      }),

    getTemplateByIdOrSlug: builder.query<{data: Template}, string>({
      query: (idOrSlug) => ({
        url: `/templates/${idOrSlug}`,
        method: "GET",
      }),
      providesTags: (result, error, idOrSlug) => [
        { type: TAG_GET_TEMPLATES_ADMIN, id: idOrSlug },
      ],
    }),

    getDeletedTemplates: builder.query<GetTemplatesResponse, GetTemplatesArgs>({
      providesTags:[TAG_GET_DELETED_TEMPLATES],
       query: (params = {}) => {
         const {
           page = 1,
           limit = 10,
           search,
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

        return { 
            url: `/templates/deleted?${queryParams.toString()}`, 
            method: "GET" 
          };
        }
      }),

      restoreTemplate: builder.mutation<EmptyResponse, TemplateMutationArg>({
        query: (slugOrId) => ({
          url: `/templates/${slugOrId}/restore`,
          method: "PATCH",
        }),
        invalidatesTags: [TAG_GET_TEMPLATES_ADMIN, TAG_GET_DELETED_TEMPLATES], 
      }),
    
      permanentDeleteTemplate: builder.mutation<EmptyResponse, TemplateMutationArg>({
        query: (slugOrId) => ({
          url: `/templates/${slugOrId}/permanent`,
          method: "DELETE", 
        }),
        invalidatesTags: [TAG_GET_DELETED_TEMPLATES], 
      }),
  }),
  overrideExisting: true
});

export const {
  useGetTemplatesQuery,
  useSaveAsTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateTemplateMutation,
  useGetTemplateByIdOrSlugQuery,
  useGetDeletedTemplatesQuery,
  useRestoreTemplateMutation,
  usePermanentDeleteTemplateMutation,
} = templatesApi;
