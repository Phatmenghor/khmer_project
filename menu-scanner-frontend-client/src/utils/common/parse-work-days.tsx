export function formatWorkDays(value: any): string {
  if (!value) return "---";

  const dayNames = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  const raw = Array.isArray(value) ? value.join(" ") : value.toString();
  const upper = raw.toUpperCase();

  const days = dayNames
    .filter((day) => upper.includes(day))
    .map((day) => day.charAt(0) + day.slice(1).toLowerCase());

  return days.length > 0 ? days.join(", ") : "---";
}
