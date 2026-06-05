import type { Middleware, UnknownAction } from "@reduxjs/toolkit";

/**
 * On the first `auth/setUser` action after sign-in, kick off a profile
 * fetch unless one already happened. The "did we fetch?" flag lives in
 * Redux (auth.profileFetched) so HMR resets, multi-tab sessions, and
 * server snapshots all behave consistently. No module-level state.
 *
 * Typed without referencing RootState/AppDispatch from "." to avoid a
 * circular-type recursion through configureStore's inferred dispatch.
 */
interface AuthSlice {
  profile: unknown;
  profileFetched: boolean;
}

export const autoFetchProfileMiddleware: Middleware =
  (storeAPI) =>
  (next) =>
  (action) => {
    const result = next(action);
    const type = (action as UnknownAction)?.type;

    if (type !== "auth/setUser") return result;

    const state = storeAPI.getState() as { auth: AuthSlice };
    if (state.auth.profileFetched || state.auth.profile) return result;

    import("@/features/auth/store/thunks/auth-thunks").then(
      ({ getProfileService }) => {
        const promise = storeAPI.dispatch(getProfileService() as never) as {
          unwrap: () => Promise<unknown>;
        };
        promise.unwrap().catch(() => {
          // On failure, leave profileFetched false so a later setUser can retry.
          import("@/features/auth/store/slice/auth-slice").then(
            ({ setProfileFetched }) => {
              storeAPI.dispatch(setProfileFetched(false));
            }
          );
        });
      }
    );

    return result;
  };
