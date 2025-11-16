import { TAG_GET_USERS } from "@/contracts/iLoveMemesApiTags";
import { iLoveMemesApi } from ".";

export const userApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<any, { page?: number; limit?: number }>({
      providesTags: [TAG_GET_USERS],
      query: ({ page = 1, limit = 10 }) => {
        const validatedLimit = limit && limit > 0 && limit <= 50 ? limit : 10;
        return {
          url: `/users?page=${page}&limit=${validatedLimit}`,
          method: "GET",
        };
      },
    }),

    addUser: builder.mutation<any, any>({
      invalidatesTags: [TAG_GET_USERS],
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
    }),

    deleteUser: builder.mutation<any, any>({
      invalidatesTags: [TAG_GET_USERS],
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { useGetUsersQuery, useAddUserMutation, useDeleteUserMutation } =
  userApi;
