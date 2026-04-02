/**
 * Smoke (manual): open the dashboard with
 * `?model=claude&mentioned=true&date_range_preset=last_3_days` - closed filter
 * triggers should show "Claude", "Mentioned", "Last 3 days", not raw keys.
 */
import { describe, expect, it } from "vitest";
import {
  MENTION_ROLLING_PRESET_DAY_COUNTS,
  mentionFilterChoices,
} from "@/config";
import {
  displayLabelForMentionModel,
  displayLabelForMentionSentiment,
  labelForValue,
} from "@/lib/helpers/mention-filter-label-helpers";

describe("mentionFilterChoices.dateRange", () => {
  it("defines a non-empty label for every configured date-range preset", () => {
    for (const choice of mentionFilterChoices.dateRange) {
      expect(choice.label.trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps the dropdown order in the config array", () => {
    expect(mentionFilterChoices.dateRange.map((entry) => entry.value)).toEqual([
      "last_3_days",
      "last_7_days",
      "last_30_days",
      "maximum",
      "custom",
    ]);
  });

  it("keeps rolling presets in the shared config", () => {
    expect(Object.keys(MENTION_ROLLING_PRESET_DAY_COUNTS)).toEqual([
      "last_3_days",
      "last_7_days",
      "last_30_days",
    ]);
  });
});

describe("mentionFilterChoices model, sentiment, and mentioned", () => {
  it("stores model choices in the config tree", () => {
    expect(mentionFilterChoices.model.map((entry) => entry.value)).toEqual([
      "all",
      "chatgpt",
      "claude",
      "gemini",
      "perplexity",
    ]);
    expect(labelForValue(mentionFilterChoices.model, "claude")).toBe("Claude");
    expect(labelForValue(mentionFilterChoices.model, "all")).toBe("All Models");
  });

  it("stores sentiment choices in the config tree", () => {
    expect(mentionFilterChoices.sentiment.map((entry) => entry.value)).toEqual([
      "all",
      "positive",
      "neutral",
      "negative",
    ]);
    expect(labelForValue(mentionFilterChoices.sentiment, "all")).toBe(
      "All Sentiments"
    );
    expect(labelForValue(mentionFilterChoices.sentiment, "positive")).toBe(
      "Positive"
    );
  });

  it("stores mentioned choices in the config tree", () => {
    expect(mentionFilterChoices.mentioned.map((entry) => entry.value)).toEqual([
      "all",
      "true",
      "false",
    ]);
    expect(labelForValue(mentionFilterChoices.mentioned, "true")).toBe(
      "Mentioned"
    );
    expect(labelForValue(mentionFilterChoices.mentioned, "false")).toBe(
      "Not Mentioned"
    );
  });
});

describe("labelForValue", () => {
  it("maps preset keys to user-facing titles", () => {
    expect(labelForValue(mentionFilterChoices.dateRange, "last_3_days")).toBe(
      "Last 3 days"
    );
    expect(labelForValue(mentionFilterChoices.dateRange, "maximum")).toBe(
      "Maximum"
    );
  });

  it("humanizes unknown strings for safe fallback display", () => {
    expect(labelForValue(mentionFilterChoices.dateRange, "unknown_preset")).toBe(
      "Unknown Preset"
    );
    expect(labelForValue(mentionFilterChoices.model, "future_bot")).toBe(
      "Future Bot"
    );
    expect(labelForValue(mentionFilterChoices.sentiment, "mixed-signal")).toBe(
      "Mixed Signal"
    );
  });

  it("returns empty or stringified values safely", () => {
    expect(labelForValue(mentionFilterChoices.model, "")).toBe("");
    expect(labelForValue(mentionFilterChoices.model, null)).toBe("");
    expect(labelForValue(mentionFilterChoices.model, 42)).toBe("42");
  });
});

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
