import { RootState } from "@/redux/store";

export const selectGlobalPageSize = (state: RootState) =>
  state.globalSettings.pageSize;
