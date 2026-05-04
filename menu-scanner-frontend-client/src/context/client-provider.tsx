"use client";

import "react-toastify/dist/ReactToastify.css";
import { ReactNode, StrictMode } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import store from "../redux/store";
import { ToastContainer } from "react-toastify";
import { InitializationProvider } from "@/context/initialization-provider";
import { InitializationLoader } from "@/components/shared/loaders/initialization-loader";

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const isProduction = process.env.NODE_ENV === "production";

  const content = (
    <InitializationProvider>
      <Provider store={store}>
        {/* Removed: ThemeInitializer and BusinessSettingsInitializer - use defaults only */}
        <InitializationLoader>
          {children}
          <Toaster />
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </InitializationLoader>
      </Provider>
    </InitializationProvider>
  );

  // Disable StrictMode in development to avoid double-mounting
  // (it's still useful for production debugging if needed)
  return isProduction ? (
    <StrictMode>{content}</StrictMode>
  ) : (
    content
  );
}
