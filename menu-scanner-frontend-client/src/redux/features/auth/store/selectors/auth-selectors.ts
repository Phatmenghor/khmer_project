/**
 * Auth Feature - Selectors
 * Memoized selectors for auth state
 */

import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

/**
 * Base selector for auth state
 */
const selectAuthState = (state: RootState) => state.auth;

/**
 * Select if auth has been initialized from cookies
 */
export const selectAuthReady = createSelector(
  [selectAuthState],
  (auth) => auth.authReady
);

/**
 * Select if user is authenticated
 */
export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

/**
 * Select current user
 */
export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

/**
 * Select user profile
 */
export const selectProfile = createSelector(
  [selectAuthState],
  (auth) => auth.profile
);

/**
 * Select loading state for login
 */
export const selectIsLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isLoading
);

/**
 * Select loading state for profile fetch
 */
export const selectIsProfileLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isProfileLoading
);

/**
 * Select auth error
 */
export const selectError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);

/**
 * Select user's access token
 */
export const selectAccessToken = createSelector(
  [selectUser],
  (user) => user?.accessToken || null
);

/**
 * Select user's roles
 */
export const selectUserRoles = createSelector(
  [selectUser],
  (user) => user?.roles || []
);

/**
 * Select user's full name
 */
export const selectUserFullName = createSelector(
  [selectUser],
  (user) => user?.fullName || ""
);

/**
 * Select user's email
 */
export const selectUserEmail = createSelector(
  [selectUser],
  (user) => user?.email || ""
);

/**
 * Select user's profile image URL
 */
export const selectUserProfileImage = createSelector(
  [selectUser],
  (user) => user?.profileImageUrl || ""
);

/**
 * Select user type
 */
export const selectUserType = createSelector(
  [selectUser],
  (user) => user?.userType || null
);

/**
 * Select if user is an admin/business user
 */
export const selectIsAdmin = createSelector(
  [selectUserType],
  (userType) => userType === "BUSINESS_USER"
);

/**
 * Select if user is a customer
 */
export const selectIsCustomer = createSelector(
  [selectUserType],
  (userType) => userType === "CUSTOMER"
);

/**
 * Check if user has a specific role
 */
export const selectHasRole = (role: string) =>
  createSelector([selectUserRoles], (roles) => roles?.includes(role) || false);
