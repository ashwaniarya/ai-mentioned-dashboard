import { describe, expect, it } from "vitest";
import {
  getDashboardBaselineMentionFilters,
  getMentionDateRangeForInclusiveLocalDayCount,
  getMentionDateRangeForMentionDateRangeRollingPreset,
  mentionFiltersShallowEqualForDashboard,
  normalizeDashboardMentionFiltersAfterParse,
} from "@/lib/filters/mention-filter-default-date-range";
import { MENTION_ROLLING_PRESET_DAY_COUNTS } from "@/config";
import type { MentionRollingDateRangePreset } from "@/config";

describe("getMentionDateRangeForInclusiveLocalDayCount", () => {
  it("returns an inclusive window of N local calendar days ending on the anchor day", () => {
    const anchorDate = new Date(2026, 3, 10, 15, 0, 0);
    const { date_from: dateFrom, date_to: dateTo } =
      getMentionDateRangeForInclusiveLocalDayCount(anchorDate, 3);
    expect(dateTo).toBe("2026-04-10");
    expect(dateFrom).toBe("2026-04-08");
    expect(MENTION_ROLLING_PRESET_DAY_COUNTS.last_3_days).toBe(3);
  });
});

describe("getMentionDateRangeForMentionDateRangeRollingPreset", () => {
  it("matches inclusive day counts from config for last_7_days", () => {
    const anchorDate = new Date(2026, 0, 15, 12, 0, 0);
    const range = getMentionDateRangeForMentionDateRangeRollingPreset(
      anchorDate,
      "last_7_days"
    );
    expect(range.date_to).toBe("2026-01-15");
    expect(range.date_from).toBe("2026-01-09");
  });

  it("supports every configured rolling preset", () => {
    const anchorDate = new Date(2026, 0, 15, 12, 0, 0);

    for (const preset of Object.keys(MENTION_ROLLING_PRESET_DAY_COUNTS) as MentionRollingDateRangePreset[]) {
      const range = getMentionDateRangeForMentionDateRangeRollingPreset(
        anchorDate,
        preset
      );

      expect(range.date_from).toBeTruthy();
      expect(range.date_to).toBeTruthy();
    }
  });
});

describe("getDashboardBaselineMentionFilters", () => {
  it("returns Maximum preset with no date bounds", () => {
    expect(getDashboardBaselineMentionFilters()).toEqual({
      mention_date_range_preset: "maximum",
    });
  });
});

describe("normalizeDashboardMentionFiltersAfterParse", () => {
  it("fills missing dates for rolling presets", () => {
    const anchorDate = new Date(2026, 0, 5, 12, 0, 0);
    const normalized = normalizeDashboardMentionFiltersAfterParse(
      { mention_date_range_preset: "last_3_days" },
      anchorDate
    );
    expect(normalized.mention_date_range_preset).toBe("last_3_days");
    expect(normalized.date_to).toBe("2026-01-05");
    expect(normalized.date_from).toBe("2026-01-03");
  });

  it("fills missing dates for every configured rolling preset", () => {
    const anchorDate = new Date(2026, 0, 5, 12, 0, 0);

    for (const preset of Object.keys(MENTION_ROLLING_PRESET_DAY_COUNTS) as MentionRollingDateRangePreset[]) {
      const normalized = normalizeDashboardMentionFiltersAfterParse(
        { mention_date_range_preset: preset },
        anchorDate
      );

      expect(normalized.mention_date_range_preset).toBe(preset);
      expect(normalized.date_from).toBeTruthy();
      expect(normalized.date_to).toBeTruthy();
    }
  });

  it("clears dates when preset is maximum", () => {
    expect(
      normalizeDashboardMentionFiltersAfterParse(
        {
          mention_date_range_preset: "maximum",
          date_from: "2026-01-01",
          date_to: "2026-01-02",
        },
        new Date()
      )
    ).toEqual({ mention_date_range_preset: "maximum" });
  });

  it("maps both dates missing to maximum for custom", () => {
    expect(
      normalizeDashboardMentionFiltersAfterParse(
        { mention_date_range_preset: "custom" },
        new Date()
      )
    ).toEqual({ mention_date_range_preset: "maximum" });
  });
});

describe("mentionFiltersShallowEqualForDashboard", () => {
  it("compares mention_date_range_preset with maximum as default", () => {
    expect(
      mentionFiltersShallowEqualForDashboard(
        { mention_date_range_preset: "maximum" },
        {}
      )
    ).toBe(true);
  });
});
