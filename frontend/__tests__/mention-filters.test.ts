/**
 * Manual smoke (dashboard + backend running):
 * Open `/` → clean URL (no date params); chart + table load full range (Maximum).
 * Choose Last 7 days → URL gains date_range_preset + date_from/date_to; data narrows.
 * Edit From → preset becomes custom (no preset key in URL, dates only); Reset → Maximum.
 * Trend chart Group By → `chart_group_by=week` when Week; Day omits the param.
 * Browser Back/Forward → filters follow URL.
 *
 * Smoke (manual): open the dashboard with
 * `?model=claude&mentioned=true&date_range_preset=last_3_days` - closed filter
 * triggers should show "Claude", "Mentioned", "Last 3 days", not raw keys.
 */
import { describe, expect, it } from "vitest";
import {
  DATE_PRESET,
  MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY,
  MENTION_ROLLING_PRESET_DAY_COUNTS,
  mentionFilterChoices,
} from "@/config";
import type { MentionRollingDateRangePreset } from "@/config";
import {
  buildMentionFiltersForApi,
  getDashboardBaselineMentionFilters,
  getMentionDateRangeForInclusiveLocalDayCount,
  getMentionDateRangeForMentionDateRangeRollingPreset,
  isMentionDateRangeOrderInvalid,
  mentionFiltersForApiRequestBody,
  mentionFiltersShallowEqualForDashboard,
  mentionFiltersToSortedQueryString,
  normalizeDashboardMentionFiltersAfterParse,
  parseMentionFiltersFromSearchParams,
} from "@/lib/helpers/mention-filters";
import {
  displayLabelForMentionModel,
  displayLabelForMentionSentiment,
} from "@/components/mention-table/mention-table-display-labels";

// --- URL ---

describe("parseMentionFiltersFromSearchParams", () => {
  it("parses known keys and ignores invalid values", () => {
    const params = new URLSearchParams({
      model: "chatgpt",
      sentiment: "positive",
      mentioned: "true",
      date_from: "2026-01-01",
      date_to: "2026-01-31",
      bogus: "x",
    });
    expect(parseMentionFiltersFromSearchParams(params)).toEqual({
      model: "chatgpt",
      sentiment: "positive",
      mentioned: true,
      date_from: "2026-01-01",
      date_to: "2026-01-31",
      mention_date_range_preset: "custom",
    });
  });

  it("parses group_by when valid and ignores invalid values", () => {
    expect(
      parseMentionFiltersFromSearchParams(
        new URLSearchParams({ group_by: "week" })
      )
    ).toEqual({
      group_by: "week",
      mention_date_range_preset: "maximum",
    });

    expect(
      parseMentionFiltersFromSearchParams(
        new URLSearchParams({ group_by: "month" })
      )
    ).toEqual({
      mention_date_range_preset: "maximum",
    });
  });

  it("parses namespaced chart_group_by", () => {
    expect(
      parseMentionFiltersFromSearchParams(
        new URLSearchParams({ chart_group_by: "week" }),
        "chart_"
      )
    ).toEqual({
      group_by: "week",
      mention_date_range_preset: "maximum",
    });
  });

  it("drops unknown model and sentiment strings", () => {
    const params = new URLSearchParams({
      model: "not-a-model",
      sentiment: "happy",
    });
    expect(parseMentionFiltersFromSearchParams(params)).toEqual({
      mention_date_range_preset: "maximum",
    });
  });

  it("accepts every configured model and sentiment value", () => {
    for (const { value: model } of mentionFilterChoices.model) {
      if (model === "all") continue;
      expect(
        parseMentionFiltersFromSearchParams(
          new URLSearchParams({ model })
        ).model
      ).toBe(model);
    }

    for (const { value: sentiment } of mentionFilterChoices.sentiment) {
      if (sentiment === "all") continue;
      expect(
        parseMentionFiltersFromSearchParams(
          new URLSearchParams({ sentiment })
        ).sentiment
      ).toBe(sentiment);
    }
  });

  it("drops malformed dates", () => {
    const params = new URLSearchParams({
      date_from: "01-01-2026",
      date_to: "2026-13-40",
    });
    expect(parseMentionFiltersFromSearchParams(params)).toEqual({
      mention_date_range_preset: "maximum",
    });
  });

  it("parses rolling preset from the configured query key", () => {
    const params = new URLSearchParams({
      [MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY]: "last_7_days",
      date_from: "2026-02-01",
      date_to: "2026-02-07",
    });
    expect(parseMentionFiltersFromSearchParams(params)).toEqual({
      date_from: "2026-02-01",
      date_to: "2026-02-07",
      mention_date_range_preset: "last_7_days",
    });
  });

  it("accepts every configured preset value from the URL", () => {
    for (const { value: preset } of mentionFilterChoices.dateRange) {
      const parsed = parseMentionFiltersFromSearchParams(
        new URLSearchParams({
          [MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY]: preset,
        })
      );

      expect(parsed.mention_date_range_preset).toBe(preset);
    }
  });
});

describe("mentionFilters round-trip via sorted query string", () => {
  it("round-trips facet filters with maximum preset", () => {
    const filters = {
      model: "gemini" as const,
      sentiment: "negative" as const,
      mentioned: false,
      mention_date_range_preset: "maximum" as const,
    };
    const serialized = mentionFiltersToSortedQueryString(filters);
    const again = parseMentionFiltersFromSearchParams(
      new URLSearchParams(serialized)
    );
    expect(again).toEqual(filters);
  });

  it("round-trips rolling preset and dates", () => {
    const filters = {
      mention_date_range_preset: "last_30_days" as const,
      date_from: "2026-02-01",
      date_to: "2026-02-28",
    };
    const serialized = mentionFiltersToSortedQueryString(filters);
    const again = parseMentionFiltersFromSearchParams(
      new URLSearchParams(serialized)
    );
    expect(again).toEqual(filters);
  });

  it("serializes every rolling preset under the configured query key", () => {
    for (const preset of Object.keys(MENTION_ROLLING_PRESET_DAY_COUNTS)) {
      const serialized = mentionFiltersToSortedQueryString({
        mention_date_range_preset: preset,
        date_from: "2026-02-01",
        date_to: "2026-02-28",
      });

      expect(serialized).toContain(
        `${MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY}=${preset}`
      );
    }
  });

  it("serializes dates when preset is missing but date bounds are set (custom)", () => {
    const filters = {
      date_from: "2026-03-01",
      date_to: "2026-03-10",
    };
    const serialized = mentionFiltersToSortedQueryString(filters);
    expect(serialized).toContain("date_from=");
    expect(serialized).toContain("date_to=");
    const again = parseMentionFiltersFromSearchParams(
      new URLSearchParams(serialized)
    );
    expect(again).toEqual({
      ...filters,
      mention_date_range_preset: "custom",
    });
  });

  it("round-trips custom via dates only (no preset query key)", () => {
    const filters = {
      date_from: "2026-02-01",
      date_to: "2026-02-28",
      mention_date_range_preset: "custom" as const,
    };
    const serialized = mentionFiltersToSortedQueryString(filters);
    const again = parseMentionFiltersFromSearchParams(
      new URLSearchParams(serialized)
    );
    expect(again).toEqual(filters);
  });

  it("round-trips group_by with chart_ namespace", () => {
    const filters = {
      group_by: "week" as const,
      mention_date_range_preset: "maximum" as const,
    };
    const serialized = mentionFiltersToSortedQueryString(filters, "chart_");
    expect(serialized).toContain("chart_group_by=week");
    const again = parseMentionFiltersFromSearchParams(
      new URLSearchParams(serialized),
      "chart_"
    );
    expect(again).toEqual(filters);
  });
});

// --- API payload ---

describe("isMentionDateRangeOrderInvalid", () => {
  it("returns false when either date is missing", () => {
    expect(isMentionDateRangeOrderInvalid({})).toBe(false);
    expect(
      isMentionDateRangeOrderInvalid({ date_from: "2025-01-10" })
    ).toBe(false);
    expect(isMentionDateRangeOrderInvalid({ date_to: "2025-01-10" })).toBe(
      false
    );
  });

  it("returns false when from equals to", () => {
    expect(
      isMentionDateRangeOrderInvalid({
        date_from: "2025-06-01",
        date_to: "2025-06-01",
      })
    ).toBe(false);
  });

  it("returns false when from is before to", () => {
    expect(
      isMentionDateRangeOrderInvalid({
        date_from: "2025-01-01",
        date_to: "2025-12-31",
      })
    ).toBe(false);
  });

  it("returns true when from is after to", () => {
    expect(
      isMentionDateRangeOrderInvalid({
        date_from: "2025-12-31",
        date_to: "2025-01-01",
      })
    ).toBe(true);
  });
});

describe("buildMentionFiltersForApi", () => {
  it("passes through valid filters including dates", () => {
    const input = {
      model: "chatgpt" as const,
      date_from: "2025-01-01",
      date_to: "2025-01-31",
    };
    expect(buildMentionFiltersForApi(input)).toEqual(input);
  });

  it("strips invalid date order and does not add dates when both end up missing", () => {
    expect(
      buildMentionFiltersForApi({
        model: "claude",
        sentiment: "positive" as const,
        date_from: "2025-12-31",
        date_to: "2025-01-01",
      })
    ).toEqual({
      model: "claude",
      sentiment: "positive",
    });
  });

  it("omits date bounds when both dates are missing (maximum / unbounded)", () => {
    expect(buildMentionFiltersForApi({})).toEqual({});
    expect(
      buildMentionFiltersForApi({
        mention_date_range_preset: "maximum",
      })
    ).toEqual({});
  });

  it("strips client-only preset from the result", () => {
    expect(
      buildMentionFiltersForApi({
        mention_date_range_preset: "last_7_days",
        date_from: "2025-01-01",
        date_to: "2025-01-31",
      })
    ).toEqual({ date_from: "2025-01-01", date_to: "2025-01-31" });
  });

  it("does not fill the missing side when only one date is set", () => {
    expect(
      buildMentionFiltersForApi({ date_from: "2025-06-01" })
    ).toEqual({ date_from: "2025-06-01" });
  });
});

describe("mentionFiltersForApiRequestBody", () => {
  it("drops mention_date_range_preset so it is not sent as JSON", () => {
    expect(
      mentionFiltersForApiRequestBody({
        model: "chatgpt",
        mention_date_range_preset: "last_3_days",
      })
    ).toEqual({ model: "chatgpt" });
  });
});

// --- Dashboard state & date range ---

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

    for (const preset of Object.keys(
      MENTION_ROLLING_PRESET_DAY_COUNTS
    ) as MentionRollingDateRangePreset[]) {
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

    for (const preset of Object.keys(
      MENTION_ROLLING_PRESET_DAY_COUNTS
    ) as MentionRollingDateRangePreset[]) {
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

  it("keeps custom preset when dates are not set yet (in-progress range pick)", () => {
    expect(
      normalizeDashboardMentionFiltersAfterParse(
        { mention_date_range_preset: "custom" },
        new Date()
      )
    ).toEqual({ mention_date_range_preset: "custom" });
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

  it("treats missing group_by as day for equality", () => {
    expect(
      mentionFiltersShallowEqualForDashboard({}, { group_by: undefined })
    ).toBe(true);
  });

  it("distinguishes week from default day", () => {
    expect(
      mentionFiltersShallowEqualForDashboard(
        { group_by: "week" },
        { mention_date_range_preset: "maximum" }
      )
    ).toBe(false);
  });

  it("considers two week selections equal", () => {
    expect(
      mentionFiltersShallowEqualForDashboard(
        { group_by: "week", model: "chatgpt" },
        { group_by: "week", model: "chatgpt" }
      )
    ).toBe(true);
  });
});

// --- Table display labels (use choice-display-label + mention config) ---

describe("displayLabelForMentionModel", () => {
  it("maps known API model values", () => {
    expect(displayLabelForMentionModel("claude")).toBe("Claude");
    expect(displayLabelForMentionModel("chatgpt")).toBe("ChatGPT");
    expect(displayLabelForMentionModel("CLAUDE")).toBe("Claude");
  });

  it("humanizes unknown model values", () => {
    expect(displayLabelForMentionModel("future_bot")).toBe("Future Bot");
  });
});

describe("displayLabelForMentionSentiment", () => {
  it("maps known API sentiment values", () => {
    expect(displayLabelForMentionSentiment("negative")).toBe("Negative");
    expect(displayLabelForMentionSentiment("neutral")).toBe("Neutral");
  });

  it("humanizes unknown sentiment values", () => {
    expect(displayLabelForMentionSentiment("mixed-signal")).toBe(
      "Mixed Signal"
    );
  });
});
