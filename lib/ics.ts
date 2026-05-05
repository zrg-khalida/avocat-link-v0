// Shared iCalendar (.ics) builder. Kept out of route files so the TanStack
// router code-splitter doesn't have to parse large template strings inside a
// route module — that previously triggered a "return outside function" parse
// error on dashboard.tsx.

export interface IcsEvent {
  title: string;
  description?: string;
  start: Date;
  /** Defaults to start + 1h */
  end?: Date;
  uid?: string;
}

const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

export function buildIcs(event: IcsEvent): string {
  const end = event.end ?? new Date(event.start.getTime() + 60 * 60 * 1000);
  const uid = event.uid ?? `${crypto.randomUUID()}@avocat-link.io`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Avocat-Link//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(event.start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description ?? ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(filename: string, event: IcsEvent) {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
