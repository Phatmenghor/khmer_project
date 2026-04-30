"use client";

import "react-toastify/dist/ReactToastify.css";
import { ReactNode, StrictMode } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import store from "../redux/store";
import { ToastContainer } from "react-toastify";
import { useBusinessTheme } from "@/hooks/use-business-theme";
import { BusinessSettingsInitializer } from "@/components/shared/cache/business-settings-initializer";

interface ClientProvidersProps {
  children: ReactNode;
}

// Theme provider component
function ThemeInitializer() {
  useBusinessTheme();
  return null;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const isProduction = process.env.NODE_ENV === "production";

  const content = (
    <Provider store={store}>
      <ThemeInitializer />
      <BusinessSettingsInitializer />
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
    </Provider>
  );

  // Disable StrictMode in development to avoid double-mounting
  // (it's still useful for production debugging if needed)
  return isProduction ? (
    <StrictMode>{content}</StrictMode>
  ) : (
    content
  );
}
