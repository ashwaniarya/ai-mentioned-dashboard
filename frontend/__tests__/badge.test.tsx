import { describe, expect, it } from "vitest";

import {
  mentionsTableSentimentChipClassNameBySentiment,
} from "@/constants/mentions-table.constants";

describe("mentionsTableSentimentChipClassNameBySentiment", () => {
  it("positive uses semantic success tokens", () => {
    expect(
      mentionsTableSentimentChipClassNameBySentiment.positive
    ).toContain("success");
    expect(
      mentionsTableSentimentChipClassNameBySentiment.positive
    ).not.toMatch(/emerald|green-\d/);
  });

  it("neutral uses semantic info tokens", () => {
    expect(
      mentionsTableSentimentChipClassNameBySentiment.neutral
    ).toContain("info");
    expect(
      mentionsTableSentimentChipClassNameBySentiment.neutral
    ).not.toMatch(/sky-\d|amber-/);
  });

  it("negative uses semantic destructive tokens", () => {
    expect(
      mentionsTableSentimentChipClassNameBySentiment.negative
    ).toContain("destructive");
    expect(
      mentionsTableSentimentChipClassNameBySentiment.negative
    ).not.toMatch(/rose-/);
  });

  it("unknown sentiment has no mapping", () => {
    expect(
      mentionsTableSentimentChipClassNameBySentiment.unknown
    ).toBeUndefined();
  });
});
