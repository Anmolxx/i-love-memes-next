import { I_LOVE_MEMES_API_REDUCER_KEY as I_lOVE_MEMES_REDUCER_PATH } from "@/contracts/reduxResourceTags";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { iLoveMemesApi } from "./services";
import authSliceReducer from "./slices/auth/index";

export const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    [I_lOVE_MEMES_REDUCER_PATH]: iLoveMemesApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(iLoveMemesApi.middleware);
  },
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
