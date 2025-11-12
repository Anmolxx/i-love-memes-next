// slice/authModal/index.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthModalState {
  open: boolean;
}

const initialState: AuthModalState = { open: false };

const authModalSlice = createSlice({
  name: "authModal",
  initialState,
  reducers: {
    openModal: (state) => {
      state.open = true;
    },
    closeModal: (state) => {
      state.open = false;
    },
    setOpen: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload;
    },
  },
});

export const { openModal, closeModal, setOpen } = authModalSlice.actions;
export default authModalSlice.reducer;
