import { iLoveMemesApi } from ".";

export interface IRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authApi = iLoveMemesApi.injectEndpoints({
  endpoints: (builder) => ({
    currentUserData: builder.query<any, void>({
      query: () => {
        return {
          url: "/auth/me",
          method: "get",
        };
      },
    }),

    register: builder.mutation<any, IRegisterRequest>({
      query: (body) => ({
        url: "/auth/email/register",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation<any, any>({
      query: (body) => ({
        url: "/auth/email/login",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCurrentUserDataQuery,
  useRegisterMutation,
  useLoginMutation,
} = authApi;
