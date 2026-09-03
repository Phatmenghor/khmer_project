export interface ActiveTableSession {
  tableId: string;
  tableName: string;
  seatedAt?: string;
}

import { SESSION_STORAGE_KEYS } from "@/constants/storage-keys";

const TABLE_SESSION_KEY = SESSION_STORAGE_KEYS.TABLE_SESSION;

export function getActiveTableSession(): ActiveTableSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TABLE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveTableSession(session: ActiveTableSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TABLE_SESSION_KEY, JSON.stringify({
      ...session,
      seatedAt: session.seatedAt || new Date().toISOString(),
    }));
  } catch {
    // Ignore storage errors
  }
}

export function clearActiveTableSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TABLE_SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Detects table, tableId, or tableName from URL search params (e.g. ?table=01 or ?tableId=xxx)
 * and automatically saves active table session.
 */
export function detectAndSaveTableSessionFromUrl(): ActiveTableSession | null {
  if (typeof window === "undefined") return null;
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const tableParam = searchParams.get("table");
    const tableIdParam = searchParams.get("tableId");
    const tableNameParam = searchParams.get("tableName");

    const rawTable = tableParam || tableIdParam;
    if (!rawTable) return getActiveTableSession();

    const cleanTableCode = decodeURIComponent(rawTable).replace(/^table-?/i, "").trim();
    const formattedTableName = tableNameParam
      ? decodeURIComponent(tableNameParam)
      : `Table ${cleanTableCode.padStart(2, "0")}`;

    const session: ActiveTableSession = {
      tableId: cleanTableCode,
      tableName: formattedTableName,
    };

    setActiveTableSession(session);
    return session;
  } catch {
    return getActiveTableSession();
  }
}

/**
 * Appends ?table=... to any public route link if active table session is set.
 */
export function appendTableParamToUrl(href: string): string {
  const activeSession = getActiveTableSession();
  if (!activeSession || !href || href.startsWith("http") || href.startsWith("#")) {
    return href;
  }

  try {
    const [path, queryString] = href.split("?");
    const params = new URLSearchParams(queryString || "");

    if (!params.has("table") && !params.has("tableId")) {
      params.set("table", activeSession.tableId);
    }

    const finalQuery = params.toString();
    return finalQuery ? `${path}?${finalQuery}` : path;
  } catch {
    return href;
  }
}
