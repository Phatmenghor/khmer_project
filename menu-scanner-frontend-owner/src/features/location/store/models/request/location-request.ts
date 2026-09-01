export interface LocationCreateRequest {
  label: string;
  latitude: number;
  longitude: number;
  houseNumber: string;
  streetNumber: string;
  village: string;
  commune: string;
  district: string;
  province: string;
  country: string;
  note: string;
  isPrimary: boolean;
  locationImages: { imageUrl: string }[];
}

export interface LocationUpdateRequest {
  locationId: string;
  locationData: LocationCreateRequest;
}

export interface LocationFilterRequest {
  pageNo?: number;
  pageSize?: number;
  search?: string;
}

export interface ProvinceFilterRequest {
  pageNo?: number;
  pageSize?: number;
  search?: string;
}

export interface DistrictFilterRequest {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  provinceCode?: string;
}

export interface CommuneFilterRequest {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  districtCode?: string;
}

export interface VillageFilterRequest {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  communeCode?: string;
}
