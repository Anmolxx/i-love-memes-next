import { iLoveMemesApi } from ".";
import { TAG_GET_UPLOADED_FILES } from "@/contracts/iLoveMemesApiTags";
export const filesApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({

    getFiles: builder.query<any, { page?: number; limit?: number } | void>({
      providesTags: [TAG_GET_UPLOADED_FILES],
      query: (params) => {
        const p = params || {};
        const page = Number(p.page) || 1;
        const limitRaw = Number(p.limit);
        const limit = limitRaw >= 1 && limitRaw <= 50 ? limitRaw : 50;
        const qp = new URLSearchParams();
        qp.set("page", String(page));
        if (limit !== undefined) qp.set("limit", String(limit));

        return {
          url: `/files/admin/files?${qp.toString()}`,
          method: "GET",
        };
      },
    }),

    deleteFile: builder.mutation<any, string>({
      invalidatesTags: [TAG_GET_UPLOADED_FILES],
      query: (fileId) => ({
        url: `/files/${fileId}`,
        method: "DELETE",
      }),
    }),

  }),
});

export const {
  useGetFilesQuery,
  useDeleteFileMutation
} = filesApi;
