


import { Status } from "@/constants/status/status";
import {
  AdminChangePasswordRequest,
  AllUserRequest,
  CreateUserRequest,
  UpdateUserParams,
} from "../models/request/users-request";
import { UserResponseModel } from "../models/response/users-response";
import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";


export const fetchAllUsersService = createApiThunk<any, AllUserRequest>(
  "users/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/users/my-business/all",
      params
    );
    return response.data.data;
  }
);


export const fetchUserByIdService = createApiThunk<any, string>(
  "users/fetchById",
  async (userId) => {
    const response = await axiosClientWithAuth.get(`/api/v1/users/${userId}`);
    return response.data.data;
  }
);


export const createUserService = createApiThunk<any, CreateUserRequest>(
  "users/create",
  async (userData) => {
    const response = await axiosClientWithAuth.post("/api/v1/users", userData);
    return response.data.data;
  }
);

export const importUsersBatchService = createApiThunk<any, { requests: any[]; importId?: string }>(
  "users/importBatch",
  async ({ requests, importId }) => {
    const response = await axiosClientWithAuth.post(
      `/api/v1/users/batch${importId ? `?importId=${importId}` : ""}`,
      requests
    );
    return response.data.data;
  }
);


export const updateUserService = createApiThunk<any, UpdateUserParams>(
  "users/update",
  async ({ userId, userData }) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/users/${userId}`,
      userData
    );
    return response.data.data;
  }
);


export const deleteUserService = createApiThunk<any, string>(
  "users/delete",
  async (userId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/users/${userId}`
    );
    return response.data.data;
  }
);


export const toggleUserStatusService = createApiThunk<any, UserResponseModel>(
  "users/toggleStatus",
  async (user) => {
    if (!user?.id) {
      throw new Error("User ID is required");
    }

    const newStatus =
      user?.accountStatus === "ACTIVE" ? "LOCKED" : "ACTIVE";

    const response = await axiosClientWithAuth.put(`/api/v1/users/${user.id}`, {
      accountStatus: newStatus,
    });
    return response.data.data;
  }
);


export const adminChangePasswordService = createApiThunk<
  any,
  AdminChangePasswordRequest
>("users/adminChangePassword", async (resetParam) => {
  const response = await axiosClientWithAuth.post(
    `/api/v1/users/admin/reset-password`,
    resetParam
  );
  return response.data.data;
});

export const fetchAllCustomersService = createApiThunk<any, AllUserRequest>(
  "customers/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/users/my-business/all",
      params
    );
    return response.data.data;
  }
);

export const fetchCustomerByIdService = createApiThunk<any, string>(
  "customers/fetchById",
  async (userId) => {
    const response = await axiosClientWithAuth.get(`/api/v1/users/${userId}`);
    return response.data.data;
  }
);

export const deleteCustomerService = createApiThunk<any, string>(
  "customers/delete",
  async (userId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/users/${userId}`
    );
    return response.data.data;
  }
);

export const toggleCustomerStatusService = createApiThunk<any, UserResponseModel>(
  "customers/toggleStatus",
  async (user) => {
    if (!user?.id) {
      throw new Error("Customer ID is required");
    }

    const newStatus =
      user?.accountStatus === "ACTIVE" ? "LOCKED" : "ACTIVE";

    const response = await axiosClientWithAuth.put(`/api/v1/users/${user.id}`, {
      accountStatus: newStatus,
    });
    return response.data.data;
  }
);
