


import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { scrollManager } from "@/utils/scroll/scroll-manager";

export interface PageScrollState {
  scrollY: number;
  lastUpdated: number;
}

export interface ScrollState {

  routes: {
    [path: string]: PageScrollState;
  };

  currentRoute: string | null;
}

const initialState: ScrollState = {
  routes: {},
  currentRoute: null,
};

const scrollSlice = createSlice({
  name: "scroll",
  initialState,
  reducers: {


    saveScrollPosition: (
      state,
      action: PayloadAction<{ path: string; scrollY: number }>
    ) => {
      const { path, scrollY } = action.payload;
      state.routes[path] = {
        scrollY,
        lastUpdated: Date.now(),
      };


      scrollManager.savePosition(path, scrollY);
    },


    restoreScrollPosition: (state, action: PayloadAction<string>) => {
      const path = action.payload;
      const position = scrollManager.getPosition(path);

      if (position !== null && !state.routes[path]) {
        state.routes[path] = {
          scrollY: position,
          lastUpdated: Date.now(),
        };
      }
    },


    setCurrentRoute: (state, action: PayloadAction<string>) => {
      state.currentRoute = action.payload;
    },


    clearScrollPosition: (state, action: PayloadAction<string>) => {
      const path = action.payload;
      delete state.routes[path];
      scrollManager.clearPosition(path);
    },


    clearAllScrollPositions: (state) => {
      state.routes = {};
      state.currentRoute = null;
      scrollManager.clearAllPositions();
    },


    cleanupScrollPositions: (state) => {
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000;

      Object.keys(state.routes).forEach((path) => {
        if (now - state.routes[path].lastUpdated > maxAge) {
          delete state.routes[path];
        }
      });

      scrollManager.cleanup();
    },
  },
});

export const {
  saveScrollPosition,
  restoreScrollPosition,
  setCurrentRoute,
  clearScrollPosition,
  clearAllScrollPositions,
  cleanupScrollPositions,
} = scrollSlice.actions;

export default scrollSlice.reducer;
