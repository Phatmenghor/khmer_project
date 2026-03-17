import {
  AllLocationResponseModel,
  LocationResponseModel,
  AllProvinceResponseModel,
  AllDistrictResponseModel,
  AllCommuneResponseModel,
  AllVillageResponseModel,
  ProvinceResponseModel,
  DistrictResponseModel,
  CommuneResponseModel,
} from "../response/location-response";

export interface LocationOperations {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface LocationState {
  data: AllLocationResponseModel | null;
  locations: LocationResponseModel[];
  defaultLocation: LocationResponseModel | null;
  isLoading: boolean;
  error: string | null;
  operations: LocationOperations;
}

export interface PublicLocationState {
  provinces: AllProvinceResponseModel | null;
  districts: AllDistrictResponseModel | null;
  communes: AllCommuneResponseModel | null;
  villages: AllVillageResponseModel | null;

  selectedProvince: ProvinceResponseModel | null;
  selectedDistrict: DistrictResponseModel | null;
  selectedCommune: CommuneResponseModel | null;

  loading: {
    provinces: boolean;
    districts: boolean;
    communes: boolean;
    villages: boolean;
  };
  error: string | null;
}
