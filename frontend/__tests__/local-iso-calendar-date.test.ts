import { describe, expect, it } from "vitest";
import {
  addLocalCalendarDays,
  formatLocalDateAsIsoString,
  isValidIsoCalendarDateString,
} from "@/lib/helpers/local-iso-calendar-date";

describe("formatLocalDateAsIsoString", () => {
  it("formats a local calendar day as YYYY-MM-DD", () => {
    expect(formatLocalDateAsIsoString(new Date(2026, 3, 10, 15, 0, 0))).toBe(
      "2026-04-10"
    );
  });
});

describe("addLocalCalendarDays", () => {
  it("shifts by whole local days", () => {
    const anchor = new Date(2026, 0, 15, 12, 0, 0);
    expect(formatLocalDateAsIsoString(addLocalCalendarDays(anchor, -6))).toBe(
      "2026-01-09"
    );
  });
});

describe("isValidIsoCalendarDateString", () => {
  it("accepts real calendar dates", () => {
    expect(isValidIsoCalendarDateString("2026-01-15")).toBe(true);
  });

  it("rejects wrong shape or impossible dates", () => {
    expect(isValidIsoCalendarDateString("01-15-2026")).toBe(false);
    expect(isValidIsoCalendarDateString("2026-13-40")).toBe(false);
  });
});
