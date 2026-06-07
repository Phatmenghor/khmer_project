


import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserAuthResponseModel } from "../models/response/auth-resposne";
import {
  loginService,
  getProfileService,
  updateProfileService,
  changePasswordService,
  deleteAccountService,
} from "../thunks/auth-thunks";
import {
  telegramAuthenticateService,
  socialAuthenticateService,
  getSocialSyncService,
  syncTelegramAccountService,
  unsyncSocialAccountService,
  logoutService,
} from "../thunks/social-auth-thunks";
import { AuthState } from "../models/type/auth-types";
import {
  storeTokens,
  clearAllTokens,
  storeAdminTokens,
  clearAdminTokens,
} from "@/utils/local-storage/token";
import {
  storeUserInfo,
  clearUserInfo,
  storeAdminUserInfo,
  clearAdminUserInfo,
} from "@/utils/local-storage/userInfo";
import { SocialSyncResponse } from "../models/response/social-auth-response";

const isAdmin = (userType?: string) => userType === "BUSINESS_USER";


interface ExtendedAuthState extends AuthState {
  socialSync: SocialSyncResponse | null;
  isSocialLoading: boolean;
  isLoadingSocialSync: boolean;
  isNewUser: boolean;
  profileFetched: boolean;
}


const initialState: ExtendedAuthState = {
  isAuthenticated: false,
  authReady: false,
  user: null,
  profile: null,
  isLoading: false,
  isProfileLoading: false,
  error: null,
  socialSync: null,
  isSocialLoading: false,
  isLoadingSocialSync: false,
  isNewUser: false,
  profileFetched: false,
};


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {


    setUser: (state, action: PayloadAction<UserAuthResponseModel>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload.accessToken;
      state.authReady = true;
    },


    setAuthReady: (state) => {
      state.authReady = true;
    },

    setProfileFetched: (state, action: PayloadAction<boolean>) => {
      state.profileFetched = action.payload;
    },


    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.profile = null;
      state.error = null;
      state.socialSync = null;
      state.isNewUser = false;
      state.profileFetched = false;
      clearAllTokens();
      clearUserInfo();
      clearAdminTokens();
      clearAdminUserInfo();
    },


    clearError: (state) => {
      state.error = null;
    },


    setSocialSync: (state, action: PayloadAction<SocialSyncResponse | null>) => {
      state.socialSync = action.payload;
    },


    clearNewUserFlag: (state) => {
      state.isNewUser = false;
    },


    resetAuthState: () => initialState,
  },

  extraReducers: (builder) => {

    builder
      .addCase(loginService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload.accessToken;
        state.authReady = true;


      })
      .addCase(loginService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });


    builder
      .addCase(getProfileService.pending, (state) => {
        state.isProfileLoading = true;
        state.error = null;
      })
      .addCase(getProfileService.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.profile = action.payload;
        state.profileFetched = true;
      })
      .addCase(getProfileService.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.error = action.payload as string;
      });


    builder
      .addCase(updateProfileService.pending, (state) => {
        state.isProfileLoading = true;
        state.error = null;
      })
      .addCase(updateProfileService.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.profile = action.payload;

        if (state.user) {
          state.user.fullName = action.payload.fullName || state.user.fullName;
          if (action.payload.profileImage) {
            state.user.profileImage = action.payload.profileImage;
          }
        }
      })
      .addCase(updateProfileService.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.error = action.payload as string;
      });


    builder
      .addCase(changePasswordService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePasswordService.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePasswordService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });


    builder
      .addCase(deleteAccountService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccountService.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.profile = null;
      })
      .addCase(deleteAccountService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });


    builder
      .addCase(telegramAuthenticateService.pending, (state) => {
        state.isSocialLoading = true;
        state.error = null;
      })
      .addCase(telegramAuthenticateService.fulfilled, (state, action) => {
        state.isSocialLoading = false;
        state.isAuthenticated = true;
        state.isNewUser = action.payload.isNewUser;


        const socialResponse = action.payload;
        state.user = {
          accessToken: socialResponse.accessToken,
          refreshToken: socialResponse.refreshToken,
          tokenType: "Bearer",
          userId: socialResponse.userId,
          userIdentifier: socialResponse.userIdentifier,
          email: socialResponse.userIdentifier,
          fullName: socialResponse.socialUsername || socialResponse.userIdentifier,
          profileImage: undefined,
          userType: socialResponse.userType,
          roles: [socialResponse.userType],
          businessId: "",
          businessName: "",
          businessStatus: "",
          isSubscriptionActive: "",
        };


        if (isAdmin(socialResponse.userType)) {
          storeAdminTokens(socialResponse.accessToken, socialResponse.refreshToken);
          storeAdminUserInfo(state.user);
        } else {
          storeTokens(socialResponse.accessToken, socialResponse.refreshToken);
          storeUserInfo(state.user);
        }
      })
      .addCase(telegramAuthenticateService.rejected, (state, action) => {
        state.isSocialLoading = false;
        state.error = action.payload as string;
      });


    builder
      .addCase(socialAuthenticateService.pending, (state) => {
        state.isSocialLoading = true;
        state.error = null;
      })
      .addCase(socialAuthenticateService.fulfilled, (state, action) => {
        state.isSocialLoading = false;
        state.isAuthenticated = true;
        state.isNewUser = action.payload.isNewUser;

        const socialResponse = action.payload;
        state.user = {
          accessToken: socialResponse.accessToken,
          refreshToken: socialResponse.refreshToken,
          tokenType: "Bearer",
          userId: socialResponse.userId,
          userIdentifier: socialResponse.userIdentifier,
          email: socialResponse.userIdentifier,
          fullName: socialResponse.socialUsername || socialResponse.userIdentifier,
          profileImage: undefined,
          userType: socialResponse.userType,
          roles: [socialResponse.userType],
          businessId: "",
          businessName: "",
          businessStatus: "",
          isSubscriptionActive: "",
        };

        if (isAdmin(socialResponse.userType)) {
          storeAdminTokens(socialResponse.accessToken, socialResponse.refreshToken);
          storeAdminUserInfo(state.user);
        } else {
          storeTokens(socialResponse.accessToken, socialResponse.refreshToken);
          storeUserInfo(state.user);
        }
      })
      .addCase(socialAuthenticateService.rejected, (state, action) => {
        state.isSocialLoading = false;
        state.error = action.payload as string;
      });


    builder
      .addCase(getSocialSyncService.pending, (state) => {
        state.isLoadingSocialSync = true;
      })
      .addCase(getSocialSyncService.fulfilled, (state, action) => {
        state.isLoadingSocialSync = false;
        state.socialSync = action.payload;
      })
      .addCase(getSocialSyncService.rejected, (state) => {
        state.isLoadingSocialSync = false;
      });


    builder
      .addCase(syncTelegramAccountService.pending, (state) => {
        state.isSocialLoading = true;
        state.error = null;
      })
      .addCase(syncTelegramAccountService.fulfilled, (state, action) => {
        state.isSocialLoading = false;
        state.socialSync = action.payload;
      })
      .addCase(syncTelegramAccountService.rejected, (state, action) => {
        state.isSocialLoading = false;
        state.error = action.payload as string;
      });


    builder
      .addCase(unsyncSocialAccountService.pending, (state) => {
        state.isSocialLoading = true;
        state.error = null;
      })
      .addCase(unsyncSocialAccountService.fulfilled, (state, action) => {
        state.isSocialLoading = false;
        state.socialSync = action.payload;
      })
      .addCase(unsyncSocialAccountService.rejected, (state, action) => {
        state.isSocialLoading = false;
        state.error = action.payload as string;
      });


    builder
      .addCase(logoutService.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutService.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;


        const isAdmin = state.user?.userType === "BUSINESS_USER";

        if (isAdmin) {

          clearAdminTokens();
          clearAdminUserInfo();
        } else {

          clearAllTokens();
          clearUserInfo();
        }

        state.user = null;
        state.profile = null;
        state.socialSync = null;
        state.isNewUser = false;
        state.profileFetched = false;
      })
      .addCase(logoutService.rejected, (state) => {

        state.isLoading = false;
        state.isAuthenticated = false;


        const isAdmin = state.user?.userType === "BUSINESS_USER";

        if (isAdmin) {

          clearAdminTokens();
          clearAdminUserInfo();
        } else {

          clearAllTokens();
          clearUserInfo();
        }

        state.user = null;
        state.profile = null;
        state.socialSync = null;
        state.isNewUser = false;
        clearAdminTokens();
        clearAdminUserInfo();
      });
  },
});

export const {
  setUser,
  setAuthReady,
  setProfileFetched,
  logout,
  clearError,
  setSocialSync,
  clearNewUserFlag,
  resetAuthState,
} = authSlice.actions;
export default authSlice.reducer;
