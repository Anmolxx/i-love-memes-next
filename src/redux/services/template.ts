import { TAG_GET_TEMPLATES_ADMIN } from "@/contracts/iLoveMemesApiTags";
import { iLoveMemesApi } from ".";

export const templatesApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
   getTemplates: builder.query<
     any,
     { page?: number; limit?: number; orderBy?: string; search?: string } | void
   >({
     query: (params) => {
       const { page = 1, limit = 10, orderBy = "createdAt", search } = params || {};
       let url = `/templates?page=${page}&limit=${limit}&orderBy=${orderBy}`;
       if (search) url += `&search=${encodeURIComponent(search)}`;
       return {
         url,
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
