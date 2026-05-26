import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserAuthResponseModel } from "../models/response/auth-resposne";
import {
  loginService,
  getProfileService,
  updateProfileService,
  changePasswordService,
  deleteAccountService,
} from "../thunks/auth-thunks";
import { AuthState } from "../models/type/auth-types";
import { clearAllTokens } from "@/utils/local-storage/token";
import { clearUserInfo } from "@/utils/local-storage/userInfo";

const initialState: AuthState = {
  isAuthenticated: false,
  authReady: false,
  user: null,
  profile: null,
  isLoading: false,
  isProfileLoading: false,
  error: null,
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
  },
});

export const { setUser, setAuthReady, logout, clearError, resetAuthState } =
  authSlice.actions;
export default authSlice.reducer;
