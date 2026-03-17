import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDefault } from "@/constants/app-resource/default/default";

const STORAGE_KEY = "global-settings";

interface GlobalSettingsState {
  pageSize: number;
}

// Load initial state from localStorage
const loadInitialState = (): GlobalSettingsState => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          pageSize: parsed.pageSize || AppDefault.PAGE_SIZE,
        };
      }
    } catch (error) {
      console.error("Error loading global settings from localStorage:", error);
    }
  }
  return {
    pageSize: AppDefault.PAGE_SIZE,
  };
};

const initialState: GlobalSettingsState = loadInitialState();

const globalSettingsSlice = createSlice({
  name: "globalSettings",
  initialState,
  reducers: {
    setGlobalPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      // Sync to localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
          console.error("Error saving global settings to localStorage:", error);
        }
      }
    },
    resetGlobalSettings: () => {
      const resetState = {
        pageSize: AppDefault.PAGE_SIZE,
      };
      // Clear localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          console.error("Error clearing global settings from localStorage:", error);
        }
      }
      return resetState;
    },
  },
});

export const { setGlobalPageSize, resetGlobalSettings } = globalSettingsSlice.actions;
export default globalSettingsSlice.reducer;
