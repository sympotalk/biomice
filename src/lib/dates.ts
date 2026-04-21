import { differenceInCalendarDays, format, parseISO } from "date-fns";

export function formatKoreanDate(iso: string) {
  const d = typeof iso === "string" ? parseISO(iso) : iso;
  return format(d, "yyyy.MM.dd");
}

export function computeDDay(startIso: string, today: Date = new Date()) {
  const start = parseISO(startIso);
  return differenceInCalendarDays(start, today);
}

export function isRegistrationOpen(
  startIso: string,
  registrationUrl: string | null | undefined,
  today: Date = new Date(),
) {
  if (!registrationUrl) return false;
  const dd = computeDDay(startIso, today);
  return dd >= 0; // still open while event hasn't started
}
