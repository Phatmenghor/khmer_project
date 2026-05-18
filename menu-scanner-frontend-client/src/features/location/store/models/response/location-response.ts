import { BasePagination } from "@/utils/common/pagination";

export interface LocationImageModel {
  imageUrl: string;
}

export interface LocationResponseModel {
  id: string;
  userId: string;
  label: string;
  village: string;
  commune: string;
  district: string;
  province: string;
  country: string;
  streetNumber: string;
  houseNumber: string;
  note: string;
  latitude: number;
  longitude: number;
  isPrimary: boolean;
  isDefault: boolean;
  fullAddress: string;
  hasCoordinates: boolean;
  locationImages: LocationImageModel[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface AllLocationResponseModel extends BasePagination {
  content: LocationResponseModel[];
}

// ----- Public hierarchy models -----

export interface ProvinceResponseModel {
  id: string;
  provinceCode: string;
  provinceEn: string;
  provinceKh: string;
  createdAt: string;
  updatedAt: string;
}

export interface AllProvinceResponseModel extends BasePagination {
  content: ProvinceResponseModel[];
}

export interface DistrictResponseModel {
  id: string;
  districtCode: string;
  districtEn: string;
  districtKh: string;
  provinceCode: string;
  province: ProvinceResponseModel;
  createdAt: string;
  updatedAt: string;
}

export interface AllDistrictResponseModel extends BasePagination {
  content: DistrictResponseModel[];
}

export interface CommuneResponseModel {
  id: string;
  communeCode: string;
  communeEn: string;
  communeKh: string;
  districtCode: string;
  district: DistrictResponseModel;
  createdAt: string;
  updatedAt: string;
}

export interface AllCommuneResponseModel extends BasePagination {
  content: CommuneResponseModel[];
}

export interface VillageResponseModel {
  id: string;
  villageCode: string;
  villageEn: string;
  villageKh: string;
  communeCode: string;
  commune: CommuneResponseModel;
  createdAt: string;
  updatedAt: string;
}

export interface AllVillageResponseModel extends BasePagination {
  content: VillageResponseModel[];
}
