export function dateTimeFormat(timestamp: string | null | undefined): string {
  if (!timestamp) return "- - -";

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "- - -";

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
  if (!dateStr) return "- - -";

  const date = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00Z`);
  if (isNaN(date.getTime())) return "- - -";

  const khDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Phnom_Penh" }),
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
  if (isNaN(date.getTime())) return "- - -";

  return date.toLocaleDateString("en-US", {
    timeZone: "Asia/Phnom_Penh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
