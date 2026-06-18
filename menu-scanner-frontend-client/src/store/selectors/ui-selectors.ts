import { RootState } from "@/store";

export const selectIsGlobalLoading = (state: RootState) =>
  state.ui.isGlobalLoading;

export const selectPendingToasts = (state: RootState) => state.ui.pendingToasts;
