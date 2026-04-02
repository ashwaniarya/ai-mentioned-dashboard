/**
 * Local-timezone calendar helpers and strict `YYYY-MM-DD` validation (no time / UTC shift).
 */

const ISO_CALENDAR_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** `anchorDate` as `YYYY-MM-DD` in the machine local calendar. */
export function formatLocalDateAsIsoString(anchorDate: Date): string {
  const year = anchorDate.getFullYear();
  const month = String(anchorDate.getMonth() + 1).padStart(2, "0");
  const day = String(anchorDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Moves `anchorDate` by `deltaDays` on the local calendar. */
export function addLocalCalendarDays(anchorDate: Date, deltaDays: number): Date {
  const next = new Date(anchorDate);
  next.setDate(next.getDate() + deltaDays);
  return next;
}

/**
 * `true` when `value` matches `YYYY-MM-DD` and is a real calendar date in the local
 * interpretation (invalid months/days rejected).
 */
export function isValidIsoCalendarDateString(value: string): boolean {
  if (!ISO_CALENDAR_DATE_REGEX.test(value)) return false;
  const [yearString, monthString, dayString] = value.split("-");
  const year = Number(yearString);
  const monthIndex = Number(monthString) - 1;
  const day = Number(dayString);
  const parsed = new Date(year, monthIndex, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === monthIndex &&
    parsed.getDate() === day
  );
}
