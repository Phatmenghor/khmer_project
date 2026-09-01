import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CacheEntry<T = any> {
  content: T[];
  pageNo: number;
  last: boolean;
}

interface ComboboxCacheState {
  caches: { [key: string]: CacheEntry };
  loading: { [key: string]: boolean };
  error: { [key: string]: string | null };
}

const initialState: ComboboxCacheState = {
  caches: {},
  loading: {},
  error: {},
};

const comboboxCacheSlice = createSlice({
  name: "comboboxCache",
  initialState,
  reducers: {
    fetchStart: (state, action: PayloadAction<string>) => {
      state.loading[action.payload] = true;
      state.error[action.payload] = null;
    },
    fetchSuccess: (
      state,
      action: PayloadAction<{
        key: string;
        content: any[];
        pageNo: number;
        last: boolean;
      }>
    ) => {
      const { key, content, pageNo, last } = action.payload;
      state.loading[key] = false;
      const existing = state.caches[key];
      if (pageNo === 1 || !existing) {
        state.caches[key] = { content, pageNo, last };
      } else {
        const merged = [...existing.content, ...content];
        const seen = new Set();
        const deduped = merged.filter((item) => {
          const id = item.id || item.code || item.provinceCode || item.districtCode || item.communeCode || item.villageCode || item.enumName || JSON.stringify(item);
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        state.caches[key] = {
          content: deduped,
          pageNo,
          last,
        };
      }
    },
    fetchFailure: (
      state,
      action: PayloadAction<{ key: string; error: string }>
    ) => {
      const { key, error } = action.payload;
      state.loading[key] = false;
      state.error[key] = error;
    },
    clearCache: (state, action: PayloadAction<string>) => {
      delete state.caches[action.payload];
      delete state.loading[action.payload];
      delete state.error[action.payload];
    },
    resetAllCache: () => initialState,
  },
});

export const {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  clearCache,
  resetAllCache,
} = comboboxCacheSlice.actions;

export default comboboxCacheSlice.reducer;
