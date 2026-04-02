"use client";

import "react-toastify/dist/ReactToastify.css";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import store from "../redux/store";
import { ToastContainer } from "react-toastify";
import { useBusinessTheme } from "@/hooks/use-business-theme";

interface ClientProvidersProps {
  children: ReactNode;
}

// Theme provider component
function ThemeInitializer() {
  useBusinessTheme();
  return null;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeInitializer />
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
}
