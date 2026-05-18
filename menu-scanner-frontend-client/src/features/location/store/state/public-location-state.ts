import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectProvinces,
  selectDistricts,
  selectCommunes,
  selectVillages,
  selectSelectedProvince,
  selectSelectedDistrict,
  selectSelectedCommune,
  selectPublicLocationLoading,
  selectPublicLocationError,
  selectProvinceOptions,
  selectDistrictOptions,
  selectCommuneOptions,
  selectVillageOptions,
} from "../selectors/public-location-selector";
import {
  fetchProvincesService,
  fetchDistrictsService,
  fetchCommunesService,
  fetchVillagesService,
} from "../thunks/public-location-thunks";
import {
  setSelectedProvince,
  setSelectedDistrict,
  setSelectedCommune,
  resetPublicLocation,
} from "../slice/public-location-slice";
import {
  ProvinceResponseModel,
  DistrictResponseModel,
  CommuneResponseModel,
} from "../models/response/location-response";
import {
  DistrictFilterRequest,
  CommuneFilterRequest,
  VillageFilterRequest,
} from "../models/request/location-request";


export const usePublicLocationState = () => {
  const dispatch = useAppDispatch();

  return {

    provinces: useAppSelector(selectProvinces),
    districts: useAppSelector(selectDistricts),
    communes: useAppSelector(selectCommunes),
    villages: useAppSelector(selectVillages),


    provinceOptions: useAppSelector(selectProvinceOptions),
    districtOptions: useAppSelector(selectDistrictOptions),
    communeOptions: useAppSelector(selectCommuneOptions),
    villageOptions: useAppSelector(selectVillageOptions),


    selectedProvince: useAppSelector(selectSelectedProvince),
    selectedDistrict: useAppSelector(selectSelectedDistrict),
    selectedCommune: useAppSelector(selectSelectedCommune),


    loading: useAppSelector(selectPublicLocationLoading),
    error: useAppSelector(selectPublicLocationError),


    fetchProvinces: () => dispatch(fetchProvincesService()),
    fetchDistricts: (params: DistrictFilterRequest) =>
      dispatch(fetchDistrictsService(params)),
    fetchCommunes: (params: CommuneFilterRequest) =>
      dispatch(fetchCommunesService(params)),
    fetchVillages: (params: VillageFilterRequest) =>
      dispatch(fetchVillagesService(params)),

    selectProvince: (province: ProvinceResponseModel | null) =>
      dispatch(setSelectedProvince(province)),
    selectDistrict: (district: DistrictResponseModel | null) =>
      dispatch(setSelectedDistrict(district)),
    selectCommune: (commune: CommuneResponseModel | null) =>
      dispatch(setSelectedCommune(commune)),
    reset: () => dispatch(resetPublicLocation()),


    dispatch,
  };
};
