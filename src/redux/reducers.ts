import { combineReducers } from "redux";
import { store } from "./store";
import authModalReducer from "./slices/authModal/index";
import authSliceReducer from "./slices/auth/index";

const rootReducer = combineReducers({
    auth: authSliceReducer,
    authModal: authModalReducer,
});

export type RootState = ReturnType<typeof store.getState>;

export default rootReducer;
