import { ConditionalActionButton } from "@/components/shared/button/custom-button";
import { AllSessionRequest } from "@/features/auth/store/models/request/session-request";
import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";


export const fetchAllSessionsService = createApiThunk<any, AllSessionRequest>(
  "sessions/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/sessions/admin/all",
      params,
    );

    return response.data.data;
  },
);


export const fetchSessionByIdService = createApiThunk<any, string>(
  "sessions/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get(`/api/v1/sessions/${id}`);
    return response.data.data;
  },
);


export const deleteSessionByIDService = createApiThunk<any, string>(
  "sessions/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/sessions/admin/${id}`,
    );
    return response.data.data;
  },
);


export const deleteSessionByUserIDService = createApiThunk<any, string>(
  "sessions/deleteByUserID",
  async (id) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/sessions/admin/logout-all/${id}`,
    );
    return response.data.data;
  },
);
