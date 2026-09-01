import { RootState } from "@/store";

export const selectGlobalPageSize = (state: RootState) =>
  state.globalSettings.pageSize;

export const selectGlobalSettings = (state: RootState) => state.globalSettings;
