"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { businessSettingsStorage } from "@/utils/storage/business-settings-storage";

interface InitializationContextType {
  isInitialized: boolean;
  colorsReady: boolean;
}

const InitializationContext = createContext<InitializationContextType>({
  isInitialized: true,
  colorsReady: false,
});

export function InitializationProvider({ children }: { children: ReactNode }) {
  const [isInitialized] = useState(true);
  const [colorsReady, setColorsReady] = useState(false);

  useEffect(() => {
    // Initialize immediately (non-blocking)
    // Then load colors asynchronously in background
    const checkCachedColors = async () => {
      try {
        const cached = businessSettingsStorage.getCached();
        if (cached?.data?.primaryColor) {
          setColorsReady(true);
          return;
        }

        // Colors will be loaded by BusinessSettingsInitializer in background
        // Check again after a short delay
        await new Promise(resolve => setTimeout(resolve, 100));
        const rechecked = businessSettingsStorage.getCached();
        if (rechecked?.data?.primaryColor) {
          setColorsReady(true);
        }
      } catch {
        // Fallback to ready even if error
        setColorsReady(true);
      }
    };

    checkCachedColors();
  }, []);

  return (
    <InitializationContext.Provider value={{ isInitialized, colorsReady }}>
      {children}
    </InitializationContext.Provider>
  );
}

export function useInitialization() {
  return useContext(InitializationContext);
}
