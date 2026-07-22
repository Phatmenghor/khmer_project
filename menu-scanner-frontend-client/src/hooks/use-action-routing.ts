"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

const ACTION_PARAMS = ["view", "edit", "delete", "create", "resetPassword"] as const;

/**
 * Manages action-based modals via URL query parameters.
 * Uses local React state to open modals instantly (avoiding Next.js router transition lag),
 * and updates URL query parameters asynchronously to preserve deep-linking capability.
 */
export function useActionRouting() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<boolean>(false);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);

  // Sync from URL params initially and when query parameters change (e.g. browser back/forward or deep link)
  useEffect(() => {
    setViewId(searchParams.get("view"));
    setEditId(searchParams.get("edit"));
    setDeleteId(searchParams.get("delete"));
    setCreateMode(searchParams.get("create") === "true");
    setResetPasswordId(searchParams.get("resetPassword"));
  }, [searchParams]);

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
      setViewId(id);
      router.push(`${pathname}?${buildParams("view", id).toString()}`);
    },
    [buildParams, pathname, router],
  );

  const openEdit = useCallback(
    (id: string) => {
      setEditId(id);
      router.push(`${pathname}?${buildParams("edit", id).toString()}`);
    },
    [buildParams, pathname, router],
  );

  const openDelete = useCallback(
    (id: string) => {
      setDeleteId(id);
      router.push(`${pathname}?${buildParams("delete", id).toString()}`);
    },
    [buildParams, pathname, router],
  );

  const openCreate = useCallback(() => {
    setCreateMode(true);
    router.push(`${pathname}?${buildParams("create", "true").toString()}`);
  }, [buildParams, pathname, router]);

  const openResetPassword = useCallback(
    (id: string) => {
      setResetPasswordId(id);
      router.push(`${pathname}?${buildParams("resetPassword", id).toString()}`);
    },
    [buildParams, pathname, router],
  );

  const closeModal = useCallback(() => {
    setViewId(null);
    setEditId(null);
    setDeleteId(null);
    setCreateMode(false);
    setResetPasswordId(null);

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
