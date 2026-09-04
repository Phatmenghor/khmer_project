


import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";


const selectAuthState = (state: RootState) => state.auth;


export const selectAuthReady = createSelector(
  [selectAuthState],
  (auth) => auth.authReady
);


export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);


export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);


export const selectProfile = createSelector(
  [selectAuthState],
  (auth) => auth.profile
);


export const selectIsLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isLoading
);


export const selectIsProfileLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isProfileLoading
);


export const selectError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);


export const selectAccessToken = createSelector(
  [selectUser],
  (user) => user?.accessToken || null
);


export const selectUserRoles = createSelector(
  [selectUser],
  (user) => user?.roles || []
);


export const selectUserFullName = createSelector(
  [selectUser],
  (user) => user?.fullName || ""
);


export const selectUserEmail = createSelector(
  [selectUser],
  (user) => user?.email || ""
);


export const selectUserProfileImage = createSelector(
  [selectUser],
  (user) => user?.profileImageUrl || (user as any)?.profileImage
);


export const selectUserType = createSelector(
  [selectUser],
  (user) => user?.userType || null
);


export const selectIsAdmin = createSelector(
  [selectUserType],
  (userType) => userType === "PLATFORM_USER"
);

export const selectIsBusinessUser = createSelector(
  [selectUserType],
  (userType) => userType === "BUSINESS_USER"
);

export const selectIsCustomer = selectIsBusinessUser;



export const selectHasRole = (role: string) =>
  createSelector([selectUserRoles], (roles) => roles?.includes(role) || false);
