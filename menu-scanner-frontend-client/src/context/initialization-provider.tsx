"use client";

import { createContext, useContext, ReactNode } from "react";

interface InitializationContextType {
  isInitialized: boolean;
  colorsReady: boolean;
}

const InitializationContext = createContext<InitializationContextType>({
  isInitialized: true,
  colorsReady: true,
});

export function InitializationProvider({ children }: { children: ReactNode }) {
  return (
    <InitializationContext.Provider value={{ isInitialized: true, colorsReady: true }}>
      {children}
    </InitializationContext.Provider>
  );
}

export function useInitialization() {
  return useContext(InitializationContext);
}
