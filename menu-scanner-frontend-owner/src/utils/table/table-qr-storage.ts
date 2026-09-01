/**
 * Local storage manager for custom Table QR Codes generated or uploaded by staff.
 */

const CUSTOM_QR_PREFIX = "custom_table_qr_";

export function getCustomTableQr(tableIdOrNumber: string): string | null {
  if (typeof window === "undefined" || !tableIdOrNumber) return null;
  try {
    const key = `${CUSTOM_QR_PREFIX}${tableIdOrNumber.toLowerCase().trim()}`;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveCustomTableQr(tableIdOrNumber: string, qrDataUrl: string): void {
  if (typeof window === "undefined" || !tableIdOrNumber || !qrDataUrl) return;
  try {
    const key = `${CUSTOM_QR_PREFIX}${tableIdOrNumber.toLowerCase().trim()}`;
    localStorage.setItem(key, qrDataUrl);
  } catch {
    // Ignore quota errors
  }
}

export function removeCustomTableQr(tableIdOrNumber: string): void {
  if (typeof window === "undefined" || !tableIdOrNumber) return;
  try {
    const key = `${CUSTOM_QR_PREFIX}${tableIdOrNumber.toLowerCase().trim()}`;
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}
