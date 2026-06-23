import type { Middleware, UnknownAction } from "@reduxjs/toolkit";
import { getProfileService } from "@/features/auth/store/thunks/auth-thunks";
import { setProfileFetched } from "@/features/auth/store/slice/auth-slice";

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
  isProfileLoading: boolean;
}

export const autoFetchProfileMiddleware: Middleware =
  (storeAPI) =>
  (next) =>
  (action) => {
    const result = next(action);
    const type = (action as UnknownAction)?.type;

    const userActions = [
      "auth/setUser",
      "auth/login/fulfilled",
      "auth/telegramAuthenticate/fulfilled",
      "auth/socialAuthenticate/fulfilled",
    ];

    if (!userActions.includes(type)) return result;

    const state = storeAPI.getState() as { auth: AuthSlice };
    if (
      state.auth.profileFetched ||
      state.auth.profile ||
      state.auth.isProfileLoading
    ) {
      return result;
    }

    const promise = storeAPI.dispatch(getProfileService() as never) as {
      unwrap: () => Promise<unknown>;
    };
    promise.unwrap().catch(() => {
      // On failure, leave profileFetched false so a later setUser can retry.
      storeAPI.dispatch(setProfileFetched(false));
    });

    return result;
  };
