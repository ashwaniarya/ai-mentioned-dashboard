import { describe, expect, it } from "vitest";

import { DATE_PRESET } from "@/config";
import { getDashboardBaselineMentionFilters } from "@/lib/helpers/mention-filter-default-date-range";
import {
  getMentionFilterSummary,
  isMentionDateRangeActiveComparedToBaseline,
} from "@/lib/helpers/mention-filter-summary";

const dashboardBaselineMentionFilters = getDashboardBaselineMentionFilters();

describe("getMentionFilterSummary", () => {
  it("returns the default summary when no filters are active", () => {
    const summary = getMentionFilterSummary({
      filters: dashboardBaselineMentionFilters,
      dashboardBaselineMentionFilters,
    });

    expect(summary.hasActiveFilters).toBe(false);
    expect(summary.activeFilterLabels).toEqual([]);
    expect(summary.mobileSummaryText).toBe("All filters");
    expect(summary.mobileActiveFilterText).toBe("Default view");
  });

  it("returns active labels for selected facet filters", () => {
    const summary = getMentionFilterSummary({
      filters: {
        ...dashboardBaselineMentionFilters,
        model: "chatgpt",
        sentiment: "positive",
      },
      dashboardBaselineMentionFilters,
    });

    expect(summary.hasActiveFilters).toBe(true);
    expect(summary.activeFilterLabels).toEqual(["ChatGPT", "Positive"]);
    expect(summary.mobileSummaryText).toBe("ChatGPT • Positive");
    expect(summary.mobileActiveFilterText).toBe("2 active");
  });

  it("compresses longer summaries after the configured visible label count", () => {
    const summary = getMentionFilterSummary({
      filters: {
        mention_date_range_preset: DATE_PRESET.CUSTOM,
        date_from: "2025-03-01",
        date_to: "2025-03-10",
        model: "claude",
        sentiment: "negative",
        mentioned: true,
      },
      dashboardBaselineMentionFilters,
    });

    expect(summary.activeFilterLabels).toEqual([
      "Custom",
      "Claude",
      "Negative",
      "Mentioned",
    ]);
    expect(summary.mobileSummaryText).toBe("Custom • Claude • +2 more");
    expect(summary.mobileActiveFilterText).toBe("4 active");
  });
});

describe("isMentionDateRangeActiveComparedToBaseline", () => {
  it("detects when the selected date range differs from baseline", () => {
    expect(
      isMentionDateRangeActiveComparedToBaseline(
        {
          ...dashboardBaselineMentionFilters,
          mention_date_range_preset: DATE_PRESET.CUSTOM,
          date_from: "2025-03-01",
          date_to: "2025-03-02",
        },
        dashboardBaselineMentionFilters
      )
    ).toBe(true);
  });

  it("treats the baseline date range as inactive", () => {
    expect(
      isMentionDateRangeActiveComparedToBaseline(
        dashboardBaselineMentionFilters,
        dashboardBaselineMentionFilters
      )
    ).toBe(false);
  });
});
