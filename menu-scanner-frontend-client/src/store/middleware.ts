import { Middleware } from "@reduxjs/toolkit";

const isDev = process.env.NODE_ENV !== "production";
const enableLogging = process.env.NEXT_PUBLIC_REDUX_LOGGING === "true" || isDev;

export const authLoggingMiddleware: Middleware =
  () => (next) => (action: unknown) => {
    const a = action as { type?: string };
    if (!enableLogging || !a?.type) return next(action);
    if (String(a.type).startsWith("auth/")) {

    }
    return next(action);
  };

export const userLoggingMiddleware: Middleware =
  () => (next) => (action: unknown) => next(action);

export const errorLoggingMiddleware: Middleware =
  () => (next) => (action: unknown) => {
    const a = action as { type?: string };
    if (!a?.type) return next(action);
    return next(action);
  };

let profileFetchTriggered = false;

export const autoFetchProfileMiddleware: Middleware =
  (storeAPI) => (next) => (action: unknown) => {
    const result = next(action);
    const a = action as { type?: string };

    if (a.type === "auth/setUser" && !profileFetchTriggered) {
      profileFetchTriggered = true;
      const state = storeAPI.getState();

      if (!state.auth.profile) {
        import("@/features/auth/store/thunks/auth-thunks").then(
          ({ getProfileService }) => {
            storeAPI.dispatch(getProfileService() as any).catch(() => {
              profileFetchTriggered = false;
            });
          }
        );
      }
    }

    return result;
  };
