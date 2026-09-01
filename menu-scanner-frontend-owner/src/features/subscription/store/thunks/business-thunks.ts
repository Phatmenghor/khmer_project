import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export const fetchAllBusinessService = createApiThunk<any, BaseGetAllRequest>(
  "businesses/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/businesses/all",
      params
    );
    return response.data.data;
  }
);
