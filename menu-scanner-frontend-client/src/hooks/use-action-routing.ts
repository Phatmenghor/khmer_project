"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const ACTION_PARAMS = ["view", "edit", "delete", "create", "resetPassword"] as const;

/**
 * Manages action-based modals via URL query parameters.
 * Uses router.replace so modal open/close doesn't pollute browser history;
 * all existing filter/search params are preserved when switching actions.
 */
export function useActionRouting() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const viewId = searchParams.get("view");
  const editId = searchParams.get("edit");
  const deleteId = searchParams.get("delete");
  const createMode = searchParams.get("create") === "true";
  const resetPasswordId = searchParams.get("resetPassword");

  /** Build a params object with all action params cleared, then set the given key. */
  const buildParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      ACTION_PARAMS.forEach((p) => params.delete(p));
      params.set(key, value);
      return params;
    },
    [searchParams],
  );

  const openView = useCallback(
    (id: string) => {
      router.push(`${pathname}?${buildParams("view", id).toString()}`);
    },
    [buildParams, pathname, router],
  );

  const openEdit = useCallback(
    (id: string) => {
      router.push(`${pathname}?${buildParams("edit", id).toString()}`);
    },
    [buildParams, pathname, router],
  );

  const openDelete = useCallback(
    (id: string) => {
      router.push(`${pathname}?${buildParams("delete", id).toString()}`);
    },
    [buildParams, pathname, router],
  );

  const openCreate = useCallback(() => {
    router.push(`${pathname}?${buildParams("create", "true").toString()}`);
  }, [buildParams, pathname, router]);

  const openResetPassword = useCallback(
    (id: string) => {
      router.push(`${pathname}?${buildParams("resetPassword", id).toString()}`);
    },
    [buildParams, pathname, router],
  );

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    ACTION_PARAMS.forEach((p) => params.delete(p));
    const queryStr = params.toString();
    router.replace(queryStr ? `${pathname}?${queryStr}` : pathname);
  }, [searchParams, pathname, router]);

  return {
    viewId,
    editId,
    deleteId,
    createMode,
    resetPasswordId,
    openView,
    openEdit,
    openDelete,
    openCreate,
    openResetPassword,
    closeModal,
  };
}
