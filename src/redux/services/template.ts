import { TAG_GET_TEMPLATES_ADMIN } from "@/contracts/iLoveMemesApiTags";
import { iLoveMemesApi } from ".";

export type TemplateOrderBy = "createdAt" | "updatedAt" | "title";
export type SortOrder = "ASC" | "DESC";

export interface GetTemplatesArgs {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  order?: SortOrder;
  orderBy?: TemplateOrderBy;
}

export const templatesApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
   getTemplates: builder.query<any, GetTemplatesArgs>({
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

    deleteTemplate: builder.mutation({
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

    getTemplateByIdOrSlug: builder.query<any, string>({
      query: (idOrSlug) => ({
        url: `/templates/${idOrSlug}`,
        method: "GET",
      }),
      providesTags: (result, error, idOrSlug) => [
        { type: TAG_GET_TEMPLATES_ADMIN, id: idOrSlug },
      ],
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
} = templatesApi;
