import { describe, expect, it } from "vitest";
import {
  buildMentionFiltersForApi,
  isMentionDateRangeOrderInvalid,
  mentionFiltersForApiRequestBody,
} from "@/lib/helpers/mention-filter-api";

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
