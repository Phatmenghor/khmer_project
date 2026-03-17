import { ConditionalActionButton } from "@/components/shared/button/action-button";
import { AllSessionRequest } from "@/redux/features/auth/store/models/request/session-request";
import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";

/**
 * Fetch all Sessions
 */
export const fetchAllSessionsService = createApiThunk<any, AllSessionRequest>(
  "sessions/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/sessions/admin/all",
      params,
    );

    console.log("#### setched sessions data:", response.data); // Debug log
    return response.data.data;
  },
);

/**
 * Fetch Session by ID
 */
export const fetchSessionByIdService = createApiThunk<any, string>(
  "sessions/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get(`/api/v1/sessions/${id}`);
    return response.data.data;
  },
);

/**
 * Delete Session by ID
 */
export const deleteSessionByIDService = createApiThunk<any, string>(
  "sessions/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/sessions/admin/${id}`,
    );
    return response.data.data;
  },
);

/**
 * Delete Session by User ID
 */
export const deleteSessionByUserIDService = createApiThunk<any, string>(
  "sessions/deleteByUserID",
  async (id) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/sessions/admin/logout-all/${id}`,
    );
    return response.data.data;
  },
);
