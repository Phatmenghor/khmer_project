import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDefault } from "@/constants/app-resource/default/default";

const STORAGE_KEY = "owner-global-settings";

interface GlobalSettingsState {
  pageSize: number;
}

const loadInitialState = (): GlobalSettingsState => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { pageSize: parsed.pageSize || AppDefault.PAGE_SIZE };
      }
    } catch {}
  }
  return { pageSize: AppDefault.PAGE_SIZE };
};

const initialState: GlobalSettingsState = loadInitialState();

const globalSettingsSlice = createSlice({
  name: "globalSettings",
  initialState,
  reducers: {
    setGlobalPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {}
      }
    },
  },
});

export const { setGlobalPageSize } = globalSettingsSlice.actions;
export default globalSettingsSlice.reducer;
