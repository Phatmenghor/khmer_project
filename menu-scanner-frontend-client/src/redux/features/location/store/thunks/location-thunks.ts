import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  LocationCreateRequest,
  LocationFilterRequest,
  LocationUpdateRequest,
} from "../models/request/location-request";
import {
  AllLocationResponseModel,
  LocationResponseModel,
} from "../models/response/location-response";

export const fetchDefaultAddressService = createApiThunk<
  LocationResponseModel,
  void
>("location/fetchDefault", async () => {
  const response = await axiosClientWithAuth.get(
    "/api/v1/locations/default"
  );
  return response.data.data;
});

export const fetchAllLocationsService = createApiThunk<
  AllLocationResponseModel,
  LocationFilterRequest | void
>("location/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/locations/my-addresses/all",
    {
      pageNo: 1,
      pageSize: 100,
      ...(params || {}),
    }
  );
  return response.data.data;
});

export const createLocationService = createApiThunk<
  LocationResponseModel,
  LocationCreateRequest
>("location/create", async (data) => {
  const response = await axiosClientWithAuth.post("/api/v1/locations", {
    ...data,
    isDefault: data.isPrimary,
  });
  return response.data.data;
});

export const updateLocationService = createApiThunk<
  LocationResponseModel,
  LocationUpdateRequest
>("location/update", async ({ locationId, locationData }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/locations/${locationId}`,
    {
      ...locationData,
      isDefault: locationData.isPrimary,
    }
  );
  return response.data.data;
});

export const deleteLocationService = createApiThunk<
  LocationResponseModel,
  string
>("location/delete", async (locationId) => {
  const response = await axiosClientWithAuth.delete(
    `/api/v1/locations/${locationId}`
  );
  return response.data.data;
});

export const fetchDefaultLocationService = createApiThunk<
  LocationResponseModel,
  void
>("location/fetchDefault", async () => {
  const response = await axiosClientWithAuth.get("/api/v1/locations/default");
  return response.data.data;
});
