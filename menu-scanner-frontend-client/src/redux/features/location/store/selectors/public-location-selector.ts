import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

// Stable empty array — avoids creating new references on every selector call
const EMPTY: never[] = [];

export const selectPublicLocationState = (state: RootState) =>
  state.publicLocation;

export const selectProvinces = createSelector(
  [selectPublicLocationState],
  (s) => s.provinces?.content ?? EMPTY
);

export const selectDistricts = createSelector(
  [selectPublicLocationState],
  (s) => s.districts?.content ?? EMPTY
);

export const selectCommunes = createSelector(
  [selectPublicLocationState],
  (s) => s.communes?.content ?? EMPTY
);

export const selectVillages = createSelector(
  [selectPublicLocationState],
  (s) => s.villages?.content ?? EMPTY
);

export const selectSelectedProvince = (state: RootState) =>
  state.publicLocation.selectedProvince;

export const selectSelectedDistrict = (state: RootState) =>
  state.publicLocation.selectedDistrict;

export const selectSelectedCommune = (state: RootState) =>
  state.publicLocation.selectedCommune;

export const selectPublicLocationLoading = (state: RootState) =>
  state.publicLocation.loading;

export const selectPublicLocationError = (state: RootState) =>
  state.publicLocation.error;

export const selectProvinceOptions = createSelector(
  [selectProvinces],
  (provinces) =>
    provinces.map((p) => ({
      value: p.provinceCode,
      label: p.provinceEn,
      labelKh: p.provinceKh,
      id: p.id,
    }))
);

export const selectDistrictOptions = createSelector(
  [selectDistricts],
  (districts) =>
    districts.map((d) => ({
      value: d.districtCode,
      label: d.districtEn,
      labelKh: d.districtKh,
      id: d.id,
    }))
);

export const selectCommuneOptions = createSelector(
  [selectCommunes],
  (communes) =>
    communes.map((c) => ({
      value: c.communeCode,
      label: c.communeEn,
      labelKh: c.communeKh,
      id: c.id,
    }))
);

export const selectVillageOptions = createSelector(
  [selectVillages],
  (villages) =>
    villages.map((v) => ({
      value: v.villageCode,
      label: v.villageEn,
      labelKh: v.villageKh,
      id: v.id,
    }))
);
