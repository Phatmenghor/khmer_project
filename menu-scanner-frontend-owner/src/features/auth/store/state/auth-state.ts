


import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectError,
  selectIsLoading,
  selectIsAuthenticated,
  selectAuthReady,
  selectUser,
  selectProfile,
  selectIsProfileLoading,
  selectUserFullName,
  selectUserEmail,
  selectUserProfileImage,
  selectUserRoles,
  selectAccessToken,
} from "../selectors/auth-selectors";

/**
 * Reusable clean hook to check if a user is logged in across Navbar, Profile, Landing, and Pricing components.
 */
export const useIsLoggedIn = (): boolean => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const profile = useAppSelector(selectProfile);
  const user = useAppSelector(selectUser);
  const accessToken = useAppSelector(selectAccessToken);

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const hasToken =
      typeof window !== "undefined"
        ? Boolean(
            localStorage.getItem("accessToken") ||
              localStorage.getItem("adminAccessToken")
          )
        : false;
    setLoggedIn(Boolean(hasToken || accessToken || isAuthenticated || profile || user));
  }, [isAuthenticated, profile, user, accessToken]);

  return loggedIn;
};

export const useAuthState = () => {
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector(selectIsLoading);
  const isProfileLoading = useAppSelector(selectIsProfileLoading);
  const error = useAppSelector(selectError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authReady = useAppSelector(selectAuthReady);
  const user = useAppSelector(selectUser);
  const profile = useAppSelector(selectProfile);
  const fullName = useAppSelector(selectUserFullName);
  const email = useAppSelector(selectUserEmail);
  const profileImage = useAppSelector(selectUserProfileImage);
  const roles = useAppSelector(selectUserRoles);
  const accessToken = useAppSelector(selectAccessToken);
  const isLoggedIn = useIsLoggedIn();

  return {
    isLoading,
    isProfileLoading,
    error,
    isAuthenticated,
    isLoggedIn,
    authReady,
    user,
    profile,
    fullName,
    email,
    profileImage,
    roles,
    accessToken,
    dispatch,
  };
};
