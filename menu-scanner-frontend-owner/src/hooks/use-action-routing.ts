"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

const ACTION_PARAMS = ["view", "edit", "delete", "create", "resetPassword"] as const;

/**
 * Manages action-based modals via URL query parameters smoothly.
 * Uses client-side window.history updates to prevent Next.js server re-fetching and rerender loops.
 */
export function useActionRouting() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<boolean>(false);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);

  // Sync state from current URL query parameters on mount & popstate
  const syncFromUrl = useCallback(() => {
    if (typeof window === "undefined") return;
    const currentParams = new URLSearchParams(window.location.search);
    setViewId(currentParams.get("view"));
    setEditId(currentParams.get("edit"));
    setDeleteId(currentParams.get("delete"));
    setCreateMode(currentParams.get("create") === "true");
    setResetPasswordId(currentParams.get("resetPassword"));
  }, []);

  useEffect(() => {
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [syncFromUrl]);

  /** Helper to update URL in address bar silently in 0ms without server GET requests */
  const updateUrlSilently = useCallback((newUrl: string, isPush = false) => {
    if (typeof window === "undefined") return;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl !== newUrl) {
      if (isPush) {
        window.history.pushState(null, "", newUrl);
      } else {
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, []);

  /** Build a params object with all action params cleared, then set the given key. */
  const buildParams = useCallback(
    (key: string, value: string) => {
      const currentSearch = typeof window !== "undefined" ? window.location.search : searchParams.toString();
      const params = new URLSearchParams(currentSearch);
      ACTION_PARAMS.forEach((p) => params.delete(p));
      params.set(key, value);
      return params;
    },
    [searchParams],
  );

  const openView = useCallback(
    (id: string) => {
      setViewId(id);
      const query = buildParams("view", id).toString();
      updateUrlSilently(`${pathname}?${query}`, true);
    },
    [buildParams, pathname, updateUrlSilently],
  );

  const openEdit = useCallback(
    (id: string) => {
      setEditId(id);
      const query = buildParams("edit", id).toString();
      updateUrlSilently(`${pathname}?${query}`, true);
    },
    [buildParams, pathname, updateUrlSilently],
  );

  const openDelete = useCallback(
    (id: string) => {
      setDeleteId(id);
      const query = buildParams("delete", id).toString();
      updateUrlSilently(`${pathname}?${query}`, true);
    },
    [buildParams, pathname, updateUrlSilently],
  );

  const openCreate = useCallback(() => {
    setCreateMode(true);
    const query = buildParams("create", "true").toString();
    updateUrlSilently(`${pathname}?${query}`, true);
  }, [buildParams, pathname, updateUrlSilently]);

  const openResetPassword = useCallback(
    (id: string) => {
      setResetPasswordId(id);
      const query = buildParams("resetPassword", id).toString();
      updateUrlSilently(`${pathname}?${query}`, true);
    },
    [buildParams, pathname, updateUrlSilently],
  );

  const closeModal = useCallback(() => {
    setViewId(null);
    setEditId(null);
    setDeleteId(null);
    setCreateMode(false);
    setResetPasswordId(null);

    const currentSearch = typeof window !== "undefined" ? window.location.search : searchParams.toString();
    const params = new URLSearchParams(currentSearch);
    ACTION_PARAMS.forEach((p) => params.delete(p));
    const queryStr = params.toString();
    const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
    updateUrlSilently(newUrl, false);
  }, [pathname, searchParams, updateUrlSilently]);

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
