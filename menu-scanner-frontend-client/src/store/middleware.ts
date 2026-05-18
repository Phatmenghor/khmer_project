import { Middleware, UnknownAction } from "@reduxjs/toolkit";

const isDev = process.env.NODE_ENV !== "production";
const enableLogging = process.env.NEXT_PUBLIC_REDUX_LOGGING === "true" || isDev;

export const authLoggingMiddleware: Middleware =
  () => (next) => (action: UnknownAction) => {
    if (!enableLogging || !action?.type) return next(action);
    if (String(action.type).startsWith("auth/")) {

    }
    return next(action);
  };

export const userLoggingMiddleware: Middleware =
  () => (next) => (action: UnknownAction) => next(action);

export const errorLoggingMiddleware: Middleware =
  () => (next) => (action: UnknownAction) => {
    if (!action?.type) return next(action);
    return next(action);
  };

let profileFetchTriggered = false;

export const autoFetchProfileMiddleware: Middleware =
  (storeAPI) => (next) => (action: UnknownAction) => {
    const result = next(action);

    if (action.type === "auth/setUser" && !profileFetchTriggered) {
      profileFetchTriggered = true;
      const state = storeAPI.getState();

      if (!state.auth.profile) {
        import("@/features/auth/store/thunks/auth-thunks").then(
          ({ getProfileService }) => {
            storeAPI.dispatch(getProfileService() as UnknownAction).catch(() => {
              profileFetchTriggered = false;
            });
          }
        );
      }
    }

    return result;
  };
