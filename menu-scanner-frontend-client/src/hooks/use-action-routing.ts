"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useActionRouting() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const viewId = searchParams.get("view");
  const editId = searchParams.get("edit");
  const deleteId = searchParams.get("delete");
  const createMode = searchParams.get("create") === "true";
  const resetPasswordId = searchParams.get("resetPassword");

  const openView = useCallback((id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("edit");
    params.delete("delete");
    params.delete("create");
    params.delete("resetPassword");
    params.set("view", id);
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const openEdit = useCallback((id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    params.delete("delete");
    params.delete("create");
    params.delete("resetPassword");
    params.set("edit", id);
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const openDelete = useCallback((id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    params.delete("edit");
    params.delete("create");
    params.delete("resetPassword");
    params.set("delete", id);
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const openCreate = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    params.delete("edit");
    params.delete("delete");
    params.delete("resetPassword");
    params.set("create", "true");
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const openResetPassword = useCallback((id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    params.delete("edit");
    params.delete("delete");
    params.delete("create");
    params.set("resetPassword", id);
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    params.delete("edit");
    params.delete("delete");
    params.delete("create");
    params.delete("resetPassword");
    const queryStr = params.toString();
    router.push(queryStr ? `${pathname}?${queryStr}` : pathname);
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
