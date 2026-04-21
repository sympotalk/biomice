import type { Conference } from "./database.types";

/**
 * Build a minimal, RFC-5545 compliant .ics string from conference rows.
 * Uses DATE values (no time) — calendar clients will treat the entries as all-day,
 * which matches how KAMS publishes conference schedules.
 */
export function conferencesToIcs(conferences: Conference[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//biomice//Medical Conferences//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:biomice 학술대회 일정",
    "X-WR-TIMEZONE:Asia/Seoul",
  ];

  for (const c of conferences) {
    const dtstart = toIcsDate(c.start_date);
    // DTEND is exclusive — add one day to end_date (or start_date if no end).
    const endSource = c.end_date ?? c.start_date;
    const dtend = toIcsDate(addOneDay(endSource));

    lines.push(
      "BEGIN:VEVENT",
      `UID:biomice-conference-${c.id}@biomice.kr`,
      `DTSTAMP:${toIcsDateTime(new Date())}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `SUMMARY:${escapeIcsText(c.event_name)}`,
      `DESCRIPTION:${escapeIcsText(buildDescription(c))}`,
      ...(c.venue ? [`LOCATION:${escapeIcsText(buildLocation(c))}`] : []),
      ...(c.registration_url ? [`URL:${c.registration_url}`] : []),
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  // RFC5545 requires CRLF line endings.
  return lines.join("\r\n") + "\r\n";
}

function buildDescription(c: Conference): string {
  const parts = [c.society_name];
  if (c.category) parts.push(`분류: ${c.category}`);
  if (c.registration_url) parts.push(`사전등록: ${c.registration_url}`);
  if (c.detail_url) parts.push(`KAMS: ${c.detail_url}`);
  return parts.join("\\n");
}

function buildLocation(c: Conference): string {
  return c.city ? `${c.venue} (${c.city})` : c.venue ?? "";
}

function toIcsDate(iso: string): string {
  // "2026-05-14" → "20260514"
  return iso.replaceAll("-", "");
}

function toIcsDateTime(d: Date): string {
  // UTC ISO timestamp → "20260421T131245Z"
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function addOneDay(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function escapeIcsText(v: string): string {
  return v
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
