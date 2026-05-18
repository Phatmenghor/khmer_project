/**
 * Scroll State Management
 * Global scroll position management for public pages
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { scrollManager } from "@/utils/scroll/scroll-manager";

export interface PageScrollState {
  scrollY: number;
  lastUpdated: number;
}

export interface ScrollState {
  // Route-based scroll positions
  routes: {
    [path: string]: PageScrollState;
  };
  // Currently active route
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
    /**
     * Save scroll position for a route
     */
    saveScrollPosition: (
      state,
      action: PayloadAction<{ path: string; scrollY: number }>
    ) => {
      const { path, scrollY } = action.payload;
      state.routes[path] = {
        scrollY,
        lastUpdated: Date.now(),
      };

      // Also save to persistent storage
      scrollManager.savePosition(path, scrollY);
    },

    /**
     * Restore scroll position for a route
     */
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

    /**
     * Set current active route
     */
    setCurrentRoute: (state, action: PayloadAction<string>) => {
      state.currentRoute = action.payload;
    },

    /**
     * Clear scroll position for a route
     */
    clearScrollPosition: (state, action: PayloadAction<string>) => {
      const path = action.payload;
      delete state.routes[path];
      scrollManager.clearPosition(path);
    },

    /**
     * Clear all scroll positions
     */
    clearAllScrollPositions: (state) => {
      state.routes = {};
      state.currentRoute = null;
      scrollManager.clearAllPositions();
    },

    /**
     * Cleanup old scroll positions
     */
    cleanupScrollPositions: (state) => {
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

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
