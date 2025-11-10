import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/redux/reducers";
import { AUTH_KEY, AUTH_TOKEN } from "@/contracts/reduxResourceTags";
import { getPersistedItem } from "@/lib/utils";
import { removeAuthCookies } from "@/actions/action";
import { iLoveMemesApi } from "@/redux/services";
import { authApi } from "@/redux/services/auth";

let persistedAuth: string | null = null;
let persistedToken: string | null = null;

if (typeof window !== "undefined") {
  persistedAuth = getPersistedItem(AUTH_KEY);
  persistedToken = getPersistedItem(AUTH_TOKEN);
}

interface AuthSlice {
  // ! using any for now
  authenticated: any | null;
  token: string;
}

let initialState: AuthSlice = {
  authenticated: persistedAuth ? JSON.parse(persistedAuth) : null,
  token: persistedToken ? JSON.parse(persistedToken).token : "",
};

export const authSlice = createSlice({
  name: AUTH_KEY,
  initialState,
  reducers: {
    setAccessToken: (state, { payload }) => {
      state.token = payload;
    },
    logout: (state) => {
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(AUTH_TOKEN);
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_TOKEN);
      removeAuthCookies();
      iLoveMemesApi.util.resetApiState();

      // Reset state to initial state or a defined default value
      state.authenticated = null;
      state.token = "";
    },
  },

  extraReducers: (builder) => {
    // builder.addMatcher(
    //   authApi.endpoints.verifyEmail.matchFulfilled,
    //   (state, { payload }) => {
    //     if (payload?.data.token) {
    //       state.authenticated = payload;
    //       if (payload.data.role === "admin") {
    //         setAuthCookie(ADMIN_AUTH_TOKEN, payload.data.token, 30);
    //       } else if (payload.data.role === "user") {
    //         setAuthCookie(AUTH_TOKEN, payload.data.token, 30);
    //       }
    //       state.token = payload.data.token;
    //       sessionStorage.setItem(
    //         AUTH_TOKEN,
    //         JSON.stringify({ token: payload.data.token })
    //       );
    //       localStorage.setItem(
    //         AUTH_TOKEN,
    //         JSON.stringify({ token: payload.data.token })
    //       );
    //       sessionStorage.setItem(AUTH_KEY, JSON.stringify(payload));
    //       localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
    //     } else {
    //       state.authenticated = null;
    //       state.token = "";
    //       sessionStorage.removeItem(AUTH_KEY);
    //       localStorage.removeItem(AUTH_TOKEN);
    //       sessionStorage.removeItem(AUTH_TOKEN);
    //       localStorage.removeItem(AUTH_KEY);
    //       removeAuthCookies();
    //     }
    //   }
    // );
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        console.log("🚀 ~ payload:", payload)
        if (payload?.token) {
          state.authenticated = payload;
          state.token = payload.token;
          sessionStorage.setItem(
            AUTH_TOKEN,
            JSON.stringify({ token: payload.token })
          );
          localStorage.setItem(
            AUTH_TOKEN,
            JSON.stringify({ token: payload.token })
          );
          sessionStorage.setItem(AUTH_KEY, JSON.stringify(payload));
          localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
        } else {
          state.authenticated = null;
          state.token = "";
          sessionStorage.removeItem(AUTH_KEY);
          localStorage.removeItem(AUTH_TOKEN);
          sessionStorage.removeItem(AUTH_TOKEN);
          localStorage.removeItem(AUTH_KEY);
          removeAuthCookies();
        }
      }
    );
    builder.addMatcher(
      authApi.endpoints.login.matchRejected,
      (state, { payload }) => {
        if (payload?.data) {
        } else {
          console.error(`Something went wrong`);
        }
        console.error(payload, "error");
      }
    );
  },
});

export default authSlice.reducer;
export const { setAccessToken, logout } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.authenticated;

export const selectIsLoggedIn = (state: RootState) =>
  !!state.auth.authenticated && !!state.auth.token;
