


import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";


export const getAllSessionsService = createApiThunk<any, void>(
  "sessions/getAll",
  async () => {
    const response = await axiosClientWithAuth.get(
      "/api/v1/sessions/admin/all",
    );
    return response.data.data;
  },
);


export const getSessionByIdService = createApiThunk<
  UserSessionResponse,
  string
>("sessions/getById", async (sessionId) => {
  const response = await axiosClientWithAuth.get(
    `/api/v1/sessions/${sessionId}`,
  );
  return response.data.data;
});


export const logoutSessionService = createApiThunk<void, string>(
  "sessions/logoutSession",
  async (sessionId) => {
    await axiosClientWithAuth.delete(`/api/v1/sessions/${sessionId}`);
  },
);


export const logoutOtherSessionsService = createApiThunk<void, string>(
  "sessions/logoutOthers",
  async (currentSessionId) => {
    await axiosClientWithAuth.post(
      `/api/v1/sessions/logout-others?currentSessionId=${currentSessionId}`,
    );
  },
);


export const logoutAllSessionsService = createApiThunk<void, void>(
  "sessions/logoutAll",
  async () => {
    await axiosClientWithAuth.post("/api/v1/sessions/logout-all");
  },
);


export const adminGetSessionsService = createApiThunk<
  PaginatedSessionsResponse,
  SessionFilterRequest
>("sessions/adminGetAll", async (filterRequest) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/sessions/admin/all",
    filterRequest,
  );
  return response.data.data;
});


export const adminGetSessionByIdService = createApiThunk<
  AdminSessionResponse,
  string
>("sessions/adminGetById", async (sessionId) => {
  const response = await axiosClientWithAuth.get(
    `/api/v1/sessions/admin/${sessionId}`,
  );
  return response.data.data;
});
