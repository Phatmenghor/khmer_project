import { axiosClient } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  CommuneFilterRequest,
  DistrictFilterRequest,
  ProvinceFilterRequest,
  VillageFilterRequest,
} from "../models/request/location-request";
import {
  AllProvinceResponseModel,
  AllDistrictResponseModel,
  AllCommuneResponseModel,
  AllVillageResponseModel,
} from "../models/response/location-response";

export const fetchProvincesService = createApiThunk<
  AllProvinceResponseModel,
  ProvinceFilterRequest | void
>("publicLocation/fetchProvinces", async (params) => {
  const response = await axiosClient.post(
    "/api/v1/public/locations/all-province",
    {
      pageNo: 1,
      pageSize: 100,
      ...(params || {}),
    }
  );
  return response.data.data;
});

export const fetchDistrictsService = createApiThunk<
  AllDistrictResponseModel,
  DistrictFilterRequest | void
>("publicLocation/fetchDistricts", async (params) => {
  const response = await axiosClient.post(
    "/api/v1/public/locations/all-district",
    {
      pageNo: 1,
      pageSize: 100,
      ...(params || {}),
    }
  );
  return response.data.data;
});

export const fetchCommunesService = createApiThunk<
  AllCommuneResponseModel,
  CommuneFilterRequest | void
>("publicLocation/fetchCommunes", async (params) => {
  const response = await axiosClient.post(
    "/api/v1/public/locations/all-commune",
    {
      pageNo: 1,
      pageSize: 100,
      ...(params || {}),
    }
  );
  return response.data.data;
});

export const fetchVillagesService = createApiThunk<
  AllVillageResponseModel,
  VillageFilterRequest | void
>("publicLocation/fetchVillages", async (params) => {
  const response = await axiosClient.post(
    "/api/v1/public/locations/all-village",
    {
      pageNo: 1,
      pageSize: 100,
      ...(params || {}),
    }
  );
  return response.data.data;
});
