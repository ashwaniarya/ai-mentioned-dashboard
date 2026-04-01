/**
 * Manual smoke (dashboard + backend running):
 * Open `/` → clean URL (no date params); chart + table load full range (Maximum).
 * Choose Last 7 days → URL gains date_range_preset + date_from/date_to; data narrows.
 * Edit From → preset becomes custom (no preset key in URL, dates only); Reset → Maximum.
 * Browser Back/Forward → filters follow URL.
 */
import { describe, expect, it } from "vitest";
import {
  MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY,
  MENTION_ROLLING_PRESET_DAY_COUNTS,
  mentionFilterChoices,
} from "@/config";
import {
  mentionFiltersToSortedQueryString,
  parseMentionFiltersFromSearchParams,
} from "@/lib/helpers/mention-filters-url";

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
});
