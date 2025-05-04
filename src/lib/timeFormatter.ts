export default function formatTimeString(timeStr: string | null): string {
  if (!timeStr) return "No time indicated";

  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute)) return "No time indicated";

  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  const formattedMinute = minute.toString().padStart(2, "0");

  return `${formattedHour}:${formattedMinute} ${period}`;
}
