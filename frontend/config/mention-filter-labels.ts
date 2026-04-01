export type FilterChoice<Value extends string = string> = {
  value: Value;
  label: string;
};

/** Date-range preset sentinels used in filter logic. */
export const DATE_PRESET = {
  MAXIMUM: "maximum",
  CUSTOM: "custom",
} as const;

/** "No selection" sentinel shared by model, sentiment, mentioned dropdowns. */
export const FACET = {
  ALL: "all",
} as const;

/** String representations of the boolean mentioned field (for URL / select). */
export const MENTIONED_VALUE = {
  YES: "true",
  NO: "false",
} as const;

/** Maps each rolling preset to its inclusive day count. Also serves as the "is rolling?" check via `key in`. */
export const MENTION_ROLLING_PRESET_DAY_COUNTS = {
  last_3_days: 3,
  last_7_days: 7,
  last_30_days: 30,
} as const;

export type MentionRollingDateRangePreset =
  keyof typeof MENTION_ROLLING_PRESET_DAY_COUNTS;

/** Single source of truth: value + label defined once per option. */
export const mentionFilterChoices = {
  dateRange: [
    { value: "last_3_days", label: "Last 3 days" },
    { value: "last_7_days", label: "Last 7 days" },
    { value: "last_30_days", label: "Last 30 days" },
    { value: "maximum", label: "Maximum" },
    { value: "custom", label: "Custom" },
  ],
  model: [
    { value: "all", label: "All Models" },
    { value: "chatgpt", label: "ChatGPT" },
    { value: "claude", label: "Claude" },
    { value: "gemini", label: "Gemini" },
    { value: "perplexity", label: "Perplexity" },
  ],
  sentiment: [
    { value: "all", label: "All Sentiments" },
    { value: "positive", label: "Positive" },
    { value: "neutral", label: "Neutral" },
    { value: "negative", label: "Negative" },
  ],
  mentioned: [
    { value: "all", label: "All Mentions" },
    { value: "true", label: "Mentioned" },
    { value: "false", label: "Not Mentioned" },
  ],
} as const satisfies Record<string, readonly FilterChoice[]>;

// ─── Derived types ───────────────────────────────────────

export type MentionDateRangePreset =
  (typeof mentionFilterChoices.dateRange)[number]["value"];

export type MentionModelValue = Exclude<
  (typeof mentionFilterChoices.model)[number]["value"],
  typeof FACET.ALL
>;

export type MentionSentimentValue = Exclude<
  (typeof mentionFilterChoices.sentiment)[number]["value"],
  typeof FACET.ALL
>;

export type MentionedSelectValue =
  (typeof mentionFilterChoices.mentioned)[number]["value"];

// ─── Validation sets (derived from choices, for URL parsing) ─

export const mentionDateRangePresetValueSet = new Set<string>(
  mentionFilterChoices.dateRange.map((c) => c.value)
);

export const mentionModelValueSet = new Set<string>(
  mentionFilterChoices.model.map((c) => c.value).filter((v) => v !== FACET.ALL)
);

export const mentionSentimentValueSet = new Set<string>(
  mentionFilterChoices.sentiment.map((c) => c.value).filter((v) => v !== FACET.ALL)
);