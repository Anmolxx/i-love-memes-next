import { TAG_GET_USERS } from "@/contracts/iLoveMemesApiTags";
import { iLoveMemesApi } from ".";

export const userApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<any, {
        page?: number;
        limit?: number;
        firstName?: string;
        lastName?: string;
        email?: string;
        status?: number; 
        role?: number; 
        orderBy?: "createdAt" | "updatedAt" | "firstName" | "lastName" | "email";
        order?: "ASC" | "DESC";
      }>({
        providesTags: [TAG_GET_USERS],
        query: ({
          page = 1,
          limit = 10,
          firstName,
          lastName,
          email,
          status, 
          role, 
          orderBy,
          order,
        }) => {
          const validatedLimit = limit > 0 && limit <= 50 ? limit : 10;
          const params = new URLSearchParams();
          params.set("page", String(page));
          params.set("limit", String(validatedLimit));
      
          if (firstName && firstName.trim().length > 0) params.set("firstName", firstName);
          if (lastName && lastName.trim().length > 0) params.set("lastName", lastName);
          if (email && email.trim().length > 0) params.set("email", email);
          if (status) params.set("status", String(status)); 
          if (role) params.set("role", String(role)); 
          if (orderBy) params.set("orderBy", orderBy);
          if (order) params.set("order", order);
      
          return {
            url: `/users?${params.toString()}`,
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
  overrideExisting: true,
});

export const { useGetUsersQuery, useAddUserMutation, useDeleteUserMutation } =
  userApi;
