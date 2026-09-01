import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectLocations,
  selectLocationData,
  selectLocationIsLoading,
  selectLocationError,
  selectLocationOperations,
  selectDefaultLocation,
  selectPrimaryLocation,
  selectLocationCount,
  selectLocationPagination,
} from "../selectors/location-selector";
import {
  fetchAllLocationsService,
  createLocationService,
  updateLocationService,
  deleteLocationService,
  fetchDefaultLocationService,
  reverseGeocodeService,
  geocodeSearchService,
  autocompletePlacesService,
} from "../thunks/location-thunks";
import { clearLocationError, resetLocationState } from "../slice/location-slice";
import {
  LocationCreateRequest,
  LocationUpdateRequest,
} from "../models/request/location-request";


export const useLocationState = () => {
  const dispatch = useAppDispatch();

  const fetchAll = useCallback(() => dispatch(fetchAllLocationsService()), [dispatch]);
  const fetchAllWithPagination = useCallback(
    (params: { pageNo: number; pageSize: number }) =>
      dispatch(fetchAllLocationsService(params)),
    [dispatch]
  );
  const create = useCallback((data: LocationCreateRequest) => dispatch(createLocationService(data)), [dispatch]);
  const update = useCallback((params: LocationUpdateRequest) => dispatch(updateLocationService(params)), [dispatch]);
  const remove = useCallback((locationId: string) => dispatch(deleteLocationService(locationId)), [dispatch]);
  const fetchDefault = useCallback(() => dispatch(fetchDefaultLocationService()), [dispatch]);
  const reverseGeocode = useCallback(
    (lat: number, lng: number) => dispatch(reverseGeocodeService({ lat, lng })),
    [dispatch]
  );
  const geocodeSearch = useCallback(
    (address: string) => dispatch(geocodeSearchService({ address })),
    [dispatch]
  );
  const autocompletePlaces = useCallback(
    (input: string) => dispatch(autocompletePlacesService({ input })),
    [dispatch]
  );
  const clearError = useCallback(() => dispatch(clearLocationError()), [dispatch]);
  const reset = useCallback(() => dispatch(resetLocationState()), [dispatch]);

  return {
    locations: useAppSelector(selectLocations),
    data: useAppSelector(selectLocationData),
    defaultLocation: useAppSelector(selectDefaultLocation),
    primaryLocation: useAppSelector(selectPrimaryLocation),
    locationCount: useAppSelector(selectLocationCount),
    locationPagination: useAppSelector(selectLocationPagination),

    isLoading: useAppSelector(selectLocationIsLoading),
    error: useAppSelector(selectLocationError),
    operations: useAppSelector(selectLocationOperations),

    fetchAll,
    fetchAllWithPagination,
    create,
    update,
    remove,
    fetchDefault,
    reverseGeocode,
    geocodeSearch,
    autocompletePlaces,
    clearError,
    reset,

    dispatch,
  };
};
