/**
 * ============================================
 * Date & Time Utilities
 * Standard: Backend UTC ➜ Cambodia (UTC +7)
 * Timezone: Asia/Phnom_Penh
 * ============================================
 */

export function dateTimeFormat(timestamp: string | null | undefined): string {
  if (!timestamp) return "- - -";

  const date = new Date(timestamp); // UTC input

  return date.toLocaleString("en-US", {
    timeZone: "Asia/Phnom_Penh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "- - -";

  // Force UTC to avoid browser timezone shift
  const date = new Date(dateStr + "T00:00:00Z");

  const khDate = new Date(
    date.toLocaleString("en-US", {
      timeZone: "Asia/Phnom_Penh",
    }),
  );

  const day = String(khDate.getDate()).padStart(2, "0");
  const month = String(khDate.getMonth() + 1).padStart(2, "0");
  const year = khDate.getFullYear();

  return `${day}-${month}-${year}`;
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return "- - -";

  const [hour, minute = "00"] = time.split(":");

  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Phnom_Penh",
  });
}
