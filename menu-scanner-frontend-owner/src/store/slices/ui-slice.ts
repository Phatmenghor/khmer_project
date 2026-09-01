import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastNotification {
  id: string;
  message: string;
  type: ToastType;
}

interface UIState {
  isGlobalLoading: boolean;
  pendingToasts: ToastNotification[];
}

const initialState: UIState = {
  isGlobalLoading: false,
  pendingToasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isGlobalLoading = action.payload;
    },

    enqueueToast: (
      state,
      action: PayloadAction<Omit<ToastNotification, "id">>,
    ) => {
      state.pendingToasts.push({
        ...action.payload,
        id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      });
    },

    dequeueToast: (state, action: PayloadAction<string>) => {
      state.pendingToasts = state.pendingToasts.filter(
        (t) => t.id !== action.payload,
      );
    },

    clearToasts: (state) => {
      state.pendingToasts = [];
    },
  },
});

export const { setGlobalLoading, enqueueToast, dequeueToast, clearToasts } =
  uiSlice.actions;

export default uiSlice.reducer;
