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
  getSocialSyncService,
  syncTelegramAccountService,
  unsyncSocialAccountService,
} from "../thunks/social-auth-thunks";
import { AuthState } from "../models/type/auth-types";
import { clearAllTokens, storeTokens } from "@/utils/local-storage/token";
import { clearUserInfo, storeUserInfo } from "@/utils/local-storage/userInfo";

const initialState: AuthState = {
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

    logout: (state) => {
      state.isAuthenticated = false;
      state.authReady = true;
      state.user = null;
      state.profile = null;
      state.error = null;
      clearAllTokens();
      clearUserInfo();
    },

    clearError: (state) => {
      state.error = null;
    },

    resetAuthState: () => ({ ...initialState, authReady: true }),
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
        state.authReady = true;
      });

    builder
      .addCase(getProfileService.pending, (state) => {
        state.isProfileLoading = true;
        state.error = null;
      })
      .addCase(getProfileService.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.profile = action.payload;
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
          state.user.profileImageUrl =
            action.payload.profileImageUrl || state.user.profileImageUrl;
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
        state.isLoading = true;
        state.error = null;
      })
      .addCase(telegramAuthenticateService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.authReady = true;

        const r = action.payload;
        const user: UserAuthResponseModel = {
          accessToken: r.accessToken,
          refreshToken: r.refreshToken,
          userId: r.userId,
          userIdentifier: r.userIdentifier,
          email: r.userIdentifier,
          fullName: r.socialUsername || r.userIdentifier,
          userType: r.userType,
          roles: [r.userType],
        };
        state.user = user;
        storeTokens(r.accessToken, r.refreshToken);
        storeUserInfo(user);
      })
      .addCase(telegramAuthenticateService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.authReady = true;
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
  },
});

export const { setUser, setAuthReady, logout, clearError, resetAuthState } =
  authSlice.actions;
export default authSlice.reducer;
