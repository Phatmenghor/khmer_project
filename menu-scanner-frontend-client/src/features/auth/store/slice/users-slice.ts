


import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createUserService,
  deleteUserService,
  fetchUserByIdService,
  fetchAllUsersService,
  toggleUserStatusService,
  updateUserService,
  adminChangePasswordService,
} from "../thunks/users-thunks";
import { UserManagementState } from "../models/type/users-types";
import { AccountStatus, UserRole } from "@/constants/status/status";


const initialState: UserManagementState = {
  data: null,
  rollbackSnapshot: null,
  selectedUser: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    accountStatus: AccountStatus.ALL,
    role: UserRole.ALL,
    pageNo: 1,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isResettingPassword: false,
    isFetchingDetail: false,
  },
};


const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {

    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },

    setAccountStatusFilter: (state, action: PayloadAction<AccountStatus>) => {
      state.filters.accountStatus = action.payload;
      state.filters.pageNo = 1;
    },

    setRoleFilter: (state, action: PayloadAction<UserRole>) => {
      state.filters.role = action.payload;
      state.filters.pageNo = 1;
    },

    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },


    clearError: (state) => {
      state.error = null;
    },

    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    resetState: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {

    builder
      .addCase(fetchAllUsersService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsersService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllUsersService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });


    builder
      .addCase(fetchUserByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedUser = null;
      })
      .addCase(fetchUserByIdService.fulfilled, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.selectedUser = action.payload;


        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (user) => user.id === action.payload.id
          );
          if (index !== -1) {
            state.data.content[index] = action.payload;
          }
        }
      })
      .addCase(fetchUserByIdService.rejected, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.error = action.payload as string;
      });


    builder
      .addCase(createUserService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createUserService.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
      })
      .addCase(createUserService.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.error = action.payload as string;
      });


    builder
      .addCase(updateUserService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUserService.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.selectedUser = action.payload;

        const updatedId = action.payload?.id || (action.meta?.arg as { id?: string })?.id;
        if (state.data && updatedId) {
          state.data.content = state.data.content.map((user) =>
            user.id === updatedId ? { ...user, ...action.payload } : user
          );
        }
      })
      .addCase(updateUserService.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteUserService.pending, (state, action) => {
        state.operations.isDeleting = true;
        state.error = null;
        state.rollbackSnapshot = state.data ? JSON.parse(JSON.stringify(state.data)) : null;
        const id = action.meta.arg as string;
        if (state.data) {
          state.data.content = state.data.content.filter((item) => item.id !== id);
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(state.data.totalElements / state.data.pageSize);
          state.data.last = state.data.pageNo >= state.data.totalPages;
          state.data.hasNext = !state.data.last;
          state.data.hasPrevious = state.data.pageNo > 1;
        }
      })
      .addCase(deleteUserService.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.rollbackSnapshot = null;
      })
      .addCase(deleteUserService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
        if (state.rollbackSnapshot) {
          state.data = state.rollbackSnapshot;
          state.rollbackSnapshot = null;
        }
      });


    builder
      .addCase(toggleUserStatusService.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleUserStatusService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = state.data.content.map((user) =>
            user.id === action.payload.id ? action.payload : user
          );
        }
      })
      .addCase(toggleUserStatusService.rejected, (state, action) => {
        state.error = action.payload as string;
      });


    builder
      .addCase(adminChangePasswordService.pending, (state) => {
        state.operations.isResettingPassword = true;
        state.error = null;
      })
      .addCase(adminChangePasswordService.fulfilled, (state) => {
        state.operations.isResettingPassword = false;
      })
      .addCase(adminChangePasswordService.rejected, (state, action) => {
        state.operations.isResettingPassword = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchFilter,
  setAccountStatusFilter,
  setRoleFilter,
  setPageNo,
  clearError,
  clearSelectedUser,
  resetFilters,
  resetState,
} = usersSlice.actions;

export default usersSlice.reducer;
