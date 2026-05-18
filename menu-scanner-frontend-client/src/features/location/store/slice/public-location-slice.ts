import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PublicLocationState } from "../models/type/location-type";
import {
  ProvinceResponseModel,
  DistrictResponseModel,
  CommuneResponseModel,
} from "../models/response/location-response";
import {
  fetchProvincesService,
  fetchDistrictsService,
  fetchCommunesService,
  fetchVillagesService,
} from "../thunks/public-location-thunks";

const initialState: PublicLocationState = {
  provinces: null,
  districts: null,
  communes: null,
  villages: null,

  selectedProvince: null,
  selectedDistrict: null,
  selectedCommune: null,

  loading: {
    provinces: false,
    districts: false,
    communes: false,
    villages: false,
  },
  error: null,
};

const publicLocationSlice = createSlice({
  name: "publicLocation",
  initialState,
  reducers: {
    setSelectedProvince: (
      state,
      action: PayloadAction<ProvinceResponseModel | null>
    ) => {
      state.selectedProvince = action.payload;
      state.selectedDistrict = null;
      state.selectedCommune = null;
      state.districts = null;
      state.communes = null;
      state.villages = null;
    },
    setSelectedDistrict: (
      state,
      action: PayloadAction<DistrictResponseModel | null>
    ) => {
      state.selectedDistrict = action.payload;
      state.selectedCommune = null;
      state.communes = null;
      state.villages = null;
    },
    setSelectedCommune: (
      state,
      action: PayloadAction<CommuneResponseModel | null>
    ) => {
      state.selectedCommune = action.payload;
      state.villages = null;
    },
    resetPublicLocation: () => initialState,
  },
  extraReducers: (builder) => {
    // Provinces
    builder
      .addCase(fetchProvincesService.pending, (state) => {
        state.loading.provinces = true;
        state.error = null;
      })
      .addCase(fetchProvincesService.fulfilled, (state, action) => {
        state.loading.provinces = false;
        state.provinces = action.payload;
      })
      .addCase(fetchProvincesService.rejected, (state, action) => {
        state.loading.provinces = false;
        state.error =
          (action.payload as string) || "Failed to fetch provinces";
      });

    // Districts
    builder
      .addCase(fetchDistrictsService.pending, (state) => {
        state.loading.districts = true;
        state.error = null;
      })
      .addCase(fetchDistrictsService.fulfilled, (state, action) => {
        state.loading.districts = false;
        state.districts = action.payload;
      })
      .addCase(fetchDistrictsService.rejected, (state, action) => {
        state.loading.districts = false;
        state.error =
          (action.payload as string) || "Failed to fetch districts";
      });

    // Communes
    builder
      .addCase(fetchCommunesService.pending, (state) => {
        state.loading.communes = true;
        state.error = null;
      })
      .addCase(fetchCommunesService.fulfilled, (state, action) => {
        state.loading.communes = false;
        state.communes = action.payload;
      })
      .addCase(fetchCommunesService.rejected, (state, action) => {
        state.loading.communes = false;
        state.error = (action.payload as string) || "Failed to fetch communes";
      });

    // Villages
    builder
      .addCase(fetchVillagesService.pending, (state) => {
        state.loading.villages = true;
        state.error = null;
      })
      .addCase(fetchVillagesService.fulfilled, (state, action) => {
        state.loading.villages = false;
        state.villages = action.payload;
      })
      .addCase(fetchVillagesService.rejected, (state, action) => {
        state.loading.villages = false;
        state.error = (action.payload as string) || "Failed to fetch villages";
      });
  },
});

export const {
  setSelectedProvince,
  setSelectedDistrict,
  setSelectedCommune,
  resetPublicLocation,
} = publicLocationSlice.actions;
export default publicLocationSlice.reducer;
