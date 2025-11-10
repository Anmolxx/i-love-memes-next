import { TAG_GET_USERS } from "@/contracts/iLoveMemesApiTags";
import { iLoveMemesApi } from ".";

export const userApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<any, any>({
      providesTags: [TAG_GET_USERS],
      query: ({ page, per_page }) => ({
        url: `/users?page=${page}&limit=${per_page}`,
        method: "GET",
      }),
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
