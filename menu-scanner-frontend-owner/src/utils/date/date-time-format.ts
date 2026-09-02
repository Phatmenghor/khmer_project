


export function dateTimeFormat(timestamp: string | null | undefined): string {
  if (!timestamp) return "- - -";

  const date = new Date(timestamp);

  return date
    .toLocaleString("en-GB", {
      timeZone: "Asia/Phnom_Penh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";

  try {
    const raw = dateStr.trim();
    if (!raw) return "—";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;

    let cleanStr = raw;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      cleanStr = `${raw}T00:00:00Z`;
    } else if (!raw.includes("T")) {
      cleanStr = `${raw}T00:00:00Z`;
    }

    const date = new Date(cleanStr);
    if (isNaN(date.getTime())) return raw;

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return "- - -";

  const [hour, minute = "00"] = time.split(":");

  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);

  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Phnom_Penh",
    })
    .replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
}

export function dateFormatLocal(timestamp: string | null | undefined): string {
  if (!timestamp) return "- - -";

  const date = new Date(timestamp);

  return date.toLocaleDateString("en-US", {
    timeZone: "Asia/Phnom_Penh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDayMonth(timestamp: string | null | undefined): string {
  if (!timestamp) return "—";

  const date = new Date(timestamp);

  return date.toLocaleDateString("en-US", {
    timeZone: "Asia/Phnom_Penh",
    month: "short",
    day: "numeric",
  });
}

/**
 * Returns YYYY-MM-DD in local time (prevents UTC shift issues from toISOString())
 */
export function getTodayLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
