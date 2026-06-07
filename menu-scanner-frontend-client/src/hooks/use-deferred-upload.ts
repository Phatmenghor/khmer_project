"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  uploadImage,
  uploadMultiSize,
  SpacesUploadResult,
  SpacesMultiSizeResult,
} from "@/services/spaces-service";

type PendingEntry = { file: File; previewUrl: string };

/**
 * Manages a set of "pending" file picks keyed by string|number, with local
 * blob: previews. Files are NOT sent to Spaces on pick — the consumer calls
 * uploadAllSingle / uploadAllMulti inside its own form-submit handler, so a
 * cancelled form leaves nothing in storage.
 *
 * Designed to back any number of file fields in one form (single image,
 * indexed lists of documents, etc.).
 */
export function useDeferredUploads<K extends string | number = string>() {
  const [pendingMap, setPendingMap] = useState<Record<string, PendingEntry>>({});

  // Mirror state into a ref so the unmount-cleanup effect can revoke object
  // URLs without forcing the effect to re-run on every change.
  const pendingRef = useRef(pendingMap);
  pendingRef.current = pendingMap;

  useEffect(() => {
    return () => {
      Object.values(pendingRef.current).forEach((e) =>
        URL.revokeObjectURL(e.previewUrl),
      );
    };
  }, []);

  const setPending = useCallback((key: K, file: File | null) => {
    setPendingMap((prev) => {
      const k = String(key);
      const old = prev[k];
      if (old) URL.revokeObjectURL(old.previewUrl);
      const next = { ...prev };
      if (file) next[k] = { file, previewUrl: URL.createObjectURL(file) };
      else delete next[k];
      return next;
    });
  }, []);

  const getPreview = useCallback(
    (key: K): string | undefined => pendingMap[String(key)]?.previewUrl,
    [pendingMap],
  );

  const hasPending = useCallback(
    (key?: K): boolean => {
      if (key === undefined) return Object.keys(pendingMap).length > 0;
      return !!pendingMap[String(key)];
    },
    [pendingMap],
  );

  const reset = useCallback(() => {
    Object.values(pendingRef.current).forEach((e) =>
      URL.revokeObjectURL(e.previewUrl),
    );
    setPendingMap({});
  }, []);

  /**
   * For indexed (array-row) use: when a row at `removedIndex` is deleted,
   * drop its pending entry and shift every higher-indexed entry down by one.
   */
  const reindexAfterRemove = useCallback((removedIndex: number) => {
    setPendingMap((prev) => {
      const next: Record<string, PendingEntry> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = Number(k);
        if (!Number.isFinite(ki)) {
          next[k] = v;
          return;
        }
        if (ki === removedIndex) {
          URL.revokeObjectURL(v.previewUrl);
          return;
        }
        next[ki < removedIndex ? ki : ki - 1] = v;
      });
      return next;
    });
  }, []);

  /** Uploads every pending file as a single-size image. Returns key → result. */
  const uploadAllSingle = useCallback(
    async (businessId: string): Promise<Record<string, SpacesUploadResult>> => {
      const out: Record<string, SpacesUploadResult> = {};
      const entries = Object.entries(pendingRef.current);
      const results = await Promise.all(
        entries.map(([, e]) => uploadImage(e.file, businessId)),
      );
      entries.forEach(([k], i) => {
        out[k] = results[i];
      });
      return out;
    },
    [],
  );

  /** Uploads every pending file as a sm/md/o multi-size image. */
  const uploadAllMulti = useCallback(
    async (
      businessId: string,
    ): Promise<Record<string, SpacesMultiSizeResult>> => {
      const out: Record<string, SpacesMultiSizeResult> = {};
      const entries = Object.entries(pendingRef.current);
      const results = await Promise.all(
        entries.map(([, e]) => uploadMultiSize(e.file, businessId)),
      );
      entries.forEach(([k], i) => {
        out[k] = results[i];
      });
      return out;
    },
    [],
  );

  return {
    setPending,
    getPreview,
    hasPending,
    reset,
    reindexAfterRemove,
    uploadAllSingle,
    uploadAllMulti,
  };
}
