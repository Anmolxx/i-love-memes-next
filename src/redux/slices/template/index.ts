import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TemplateState {
  selectedTemplateId: string | null;
}

const initialState: TemplateState = {
  selectedTemplateId: null,
};

const templateSlice = createSlice({
  name: "template",
  initialState,
  reducers: {
    setTemplateId: (state, action: PayloadAction<string | null>) => {
      state.selectedTemplateId = action.payload;
    },
    clearTemplateId: (state) => {
      state.selectedTemplateId = null;
    },
  },
});

export const { setTemplateId, clearTemplateId } = templateSlice.actions;
export default templateSlice.reducer;
