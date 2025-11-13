import { I_LOVE_MEMES_API_REDUCER_KEY } from "@/contracts/reduxResourceTags";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/redux/store";
import { TAG_GET_USERS, TAG_GET_TEMPLATES_ADMIN, COMMUNITY_MEMES, TAG_MEME_INTERACTION_SUMMARY, TAGS_API } from "@/contracts/iLoveMemesApiTags";

export const iLoveMemesApi = createApi({
  reducerPath: I_LOVE_MEMES_API_REDUCER_KEY,
  tagTypes: [TAG_GET_USERS, TAG_GET_TEMPLATES_ADMIN, COMMUNITY_MEMES, TAG_MEME_INTERACTION_SUMMARY, TAGS_API],
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_SERVER}/api/v1`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      // headers.set("ngrok-skip-browser-warning", "123");
      return headers;
    },
  }),
  endpoints: (builder) => ({}),
});
