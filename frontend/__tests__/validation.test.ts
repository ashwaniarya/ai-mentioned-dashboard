import { describe, expect, it } from "vitest";
import {
  buildMentionFiltersForApi,
  isMentionDateRangeOrderInvalid,
} from "@/lib/validation";

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

  it("strips dates when order is invalid but keeps other fields", () => {
    expect(
      buildMentionFiltersForApi({
        model: "claude",
        sentiment: "positive" as const,
        date_from: "2025-12-31",
        date_to: "2025-01-01",
      })
    ).toEqual({ model: "claude", sentiment: "positive" });
  });
});
