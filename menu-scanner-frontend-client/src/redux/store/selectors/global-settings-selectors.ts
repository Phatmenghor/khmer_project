import { RootState } from "../index";

export const selectGlobalPageSize = (state: RootState) =>
  state.globalSettings.pageSize;

export const selectGlobalSettings = (state: RootState) => state.globalSettings;
