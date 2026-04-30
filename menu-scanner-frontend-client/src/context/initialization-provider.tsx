"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { businessSettingsStorage } from "@/utils/storage/business-settings-storage";

interface InitializationContextType {
  isInitialized: boolean;
  isLoading: boolean;
}

const InitializationContext = createContext<InitializationContextType>({
  isInitialized: false,
  isLoading: true,
});

export function InitializationProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if business settings are cached and valid
    const initializeFromCache = () => {
      try {
        const cached = businessSettingsStorage.getCached();

        // If we have cached settings with a primary color, we're ready to render
        if (cached?.data?.primaryColor) {
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        // If no cache or no primary color, wait a bit for the initializer to populate it
        // Give it 500ms to load from storage
        setTimeout(() => {
          try {
            const rechecked = businessSettingsStorage.getCached();
            if (rechecked?.data?.primaryColor) {
              setIsInitialized(true);
            } else {
              // No cache yet, render with defaults (fallback)
              setIsInitialized(true);
            }
          } catch {
            setIsInitialized(true);
          }
          setIsLoading(false);
        }, 500);
      } catch {
        // On error, still initialize
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeFromCache();
  }, []);

  return (
    <InitializationContext.Provider value={{ isInitialized, isLoading }}>
      {children}
    </InitializationContext.Provider>
  );
}

export function useInitialization() {
  return useContext(InitializationContext);
}
