


import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectScrollState,
  selectCurrentRoute,
  selectAllRoutes,
  selectRouteScrollPosition,
  selectHasScrollPosition,
} from "../selectors/scroll-selectors";
import {
  saveScrollPosition,
  restoreScrollPosition,
  setCurrentRoute,
  clearScrollPosition,
  clearAllScrollPositions,
  cleanupScrollPositions,
} from "../slice/scroll-slice";


export const useScrollState = () => {
  const dispatch = useAppDispatch();
  const scrollState = useAppSelector(selectScrollState);
  const currentRoute = useAppSelector(selectCurrentRoute);
  const allRoutes = useAppSelector(selectAllRoutes);

  return {

    scrollState,
    currentRoute,
    allRoutes,


    saveScrollPosition: (path: string, scrollY: number) =>
      dispatch(saveScrollPosition({ path, scrollY })),
    restoreScrollPosition: (path: string) =>
      dispatch(restoreScrollPosition(path)),
    setCurrentRoute: (path: string) => dispatch(setCurrentRoute(path)),
    clearScrollPosition: (path: string) => dispatch(clearScrollPosition(path)),
    clearAllScrollPositions: () => dispatch(clearAllScrollPositions()),
    cleanupScrollPositions: () => dispatch(cleanupScrollPositions()),


    dispatch,
  };
};


export const useScrollPosition = (path: string) => {
  return useAppSelector((state) => selectRouteScrollPosition(path)(state));
};


export const useHasScrollPosition = (path: string) => {
  return useAppSelector((state) => selectHasScrollPosition(path)(state));
};
