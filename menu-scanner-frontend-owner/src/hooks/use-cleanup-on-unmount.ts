


import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store";
import { ActionCreatorWithoutPayload } from "@reduxjs/toolkit";


export function useCleanupOnUnmount(
  cleanupActions:
    | ActionCreatorWithoutPayload
    | ActionCreatorWithoutPayload[]
    | (() => void)
    | (() => void)[]
) {
  const dispatch = useAppDispatch();
  const actionsRef = useRef(cleanupActions);


  useEffect(() => {
    actionsRef.current = cleanupActions;
  }, [cleanupActions]);

  useEffect(() => {
    return () => {
      const actions = Array.isArray(actionsRef.current)
        ? actionsRef.current
        : [actionsRef.current];

      actions.forEach((action) => {
        if (typeof action === "function") {

          const result = action();
          if (result && typeof result === "object" && "type" in result) {
            dispatch(result);
          }
        }
      });
    };
  }, [dispatch]);
}


export function useRouteCleanup(
  routePattern: string,
  cleanupActions:
    | ActionCreatorWithoutPayload
    | ActionCreatorWithoutPayload[]
    | (() => void)
    | (() => void)[]
) {
  const dispatch = useAppDispatch();
  const actionsRef = useRef(cleanupActions);
  const routePatternRef = useRef(routePattern);


  useEffect(() => {
    actionsRef.current = cleanupActions;
    routePatternRef.current = routePattern;
  }, [cleanupActions, routePattern]);

  useEffect(() => {
    return () => {

      const currentPath = window.location.pathname;
      if (!currentPath.startsWith(routePatternRef.current)) {
        const actions = Array.isArray(actionsRef.current)
          ? actionsRef.current
          : [actionsRef.current];

        actions.forEach((action) => {
          if (typeof action === "function") {
            const result = action();
            if (result && typeof result === "object" && "type" in result) {
              dispatch(result);
            }
          }
        });
      }
    };
  }, [dispatch]);
}


export function useAdminCleanup(
  cleanupActions:
    | ActionCreatorWithoutPayload
    | ActionCreatorWithoutPayload[]
    | (() => void)
    | (() => void)[]
) {
  useRouteCleanup("/admin", cleanupActions);
}


export function usePublicCleanup(
  cleanupActions:
    | ActionCreatorWithoutPayload
    | ActionCreatorWithoutPayload[]
    | (() => void)
    | (() => void)[]
) {
  const dispatch = useAppDispatch();
  const actionsRef = useRef(cleanupActions);

  useEffect(() => {
    actionsRef.current = cleanupActions;
  }, [cleanupActions]);

  useEffect(() => {
    return () => {

      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/admin")) {
        const actions = Array.isArray(actionsRef.current)
          ? actionsRef.current
          : [actionsRef.current];

        actions.forEach((action) => {
          if (typeof action === "function") {
            const result = action();
            if (result && typeof result === "object" && "type" in result) {
              dispatch(result);
            }
          }
        });
      }
    };
  }, [dispatch]);
}
