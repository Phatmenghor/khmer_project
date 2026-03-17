import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectLocations,
  selectLocationData,
  selectLocationIsLoading,
  selectLocationError,
  selectLocationOperations,
  selectDefaultLocation,
  selectPrimaryLocation,
  selectLocationCount,
} from "../selectors/location-selector";
import {
  fetchAllLocationsService,
  createLocationService,
  updateLocationService,
  deleteLocationService,
  fetchDefaultLocationService,
} from "../thunks/location-thunks";
import { clearLocationError, resetLocationState } from "../slice/location-slice";
import {
  LocationCreateRequest,
  LocationUpdateRequest,
} from "../models/request/location-request";

/**
 * Custom state hook for user location management.
 * Encapsulates Redux dispatch + selectors into a single composable hook.
 */
export const useLocationState = () => {
  const dispatch = useAppDispatch();

  const fetchAll = useCallback(() => dispatch(fetchAllLocationsService()), [dispatch]);
  const create = useCallback((data: LocationCreateRequest) => dispatch(createLocationService(data)), [dispatch]);
  const update = useCallback((params: LocationUpdateRequest) => dispatch(updateLocationService(params)), [dispatch]);
  const remove = useCallback((locationId: string) => dispatch(deleteLocationService(locationId)), [dispatch]);
  const fetchDefault = useCallback(() => dispatch(fetchDefaultLocationService()), [dispatch]);
  const clearError = useCallback(() => dispatch(clearLocationError()), [dispatch]);
  const reset = useCallback(() => dispatch(resetLocationState()), [dispatch]);

  return {
    // ── State ──────────────────────────────────────────────────────────
    locations: useAppSelector(selectLocations),
    data: useAppSelector(selectLocationData),
    defaultLocation: useAppSelector(selectDefaultLocation),
    primaryLocation: useAppSelector(selectPrimaryLocation),
    locationCount: useAppSelector(selectLocationCount),

    // ── Loading / Error ────────────────────────────────────────────────
    isLoading: useAppSelector(selectLocationIsLoading),
    error: useAppSelector(selectLocationError),
    operations: useAppSelector(selectLocationOperations),

    // ── Actions ────────────────────────────────────────────────────────
    fetchAll,
    create,
    update,
    remove,
    fetchDefault,
    clearError,
    reset,

    // ── Raw dispatch ──────────────────────────────────────────────────
    dispatch,
  };
};
