"use client";

import store from "@/redux/store";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth-provider";

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster position="top-right" richColors closeButton />
    </Provider>
  );
}
