import { TAG_GET_TEMPLATES_ADMIN } from "@/contracts/iLoveMemesApiTags";
import { iLoveMemesApi } from ".";

export type TemplateOrderBy = "createdAt" | "updatedAt" | "title";
export type SortOrder = "ASC" | "DESC";

export interface GetTemplatesArgs {
  page?: number;
  limit?: number;
  search?: string;
  order?: SortOrder;
  orderBy?: TemplateOrderBy;
}

export const templatesApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
   getTemplates: builder.query<any, GetTemplatesArgs>({
       query: (params = {}) => {
         const {
           page = 1,
           limit = 10,
           search,
           orderBy = "createdAt",
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
   
    uploadFile: builder.mutation<
      { file: { id: string; path: string } },
      FormData
    >({
      query: (formData) => ({
        url: "/files/upload",
        method: "POST",
        body: formData,
      }),
    }),

    saveAsTemplate: builder.mutation<any, any>({
      query: (body) => ({
        url: "/templates",
        method: "POST",
        body,
      }),
    }),

    getAllTemplates: builder.query({
      providesTags: [TAG_GET_TEMPLATES_ADMIN],
      query: ({ page, per_page }) => ({
        url: `/templates?page=${page}&limit=${per_page}`,
        method: "GET",
      }),
    }),

    deleteTemplate: builder.mutation({
      invalidatesTags: [TAG_GET_TEMPLATES_ADMIN],
      query: (id) => ({
        url: `/templates/${id}`,
        method: "DELETE",
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
});

export const {
  useGetTemplatesQuery,
  useUploadFileMutation,
  useSaveAsTemplateMutation,
  useGetAllTemplatesQuery,
  useDeleteTemplateMutation,
  useGetTemplateByIdOrSlugQuery,
} = templatesApi;
