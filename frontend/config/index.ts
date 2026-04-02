export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const DEFAULT_PAGE_SIZE = 25;

/** SWR: skip duplicate in-flight requests within this window (milliseconds). */
export const SWR_DEDUPING_INTERVAL_MS = 2000;

/** Dashboard filter controls: delay before mentions/trends refetch (milliseconds). */
export const MENTION_FILTER_DEBOUNCE_INTERVAL_MS = 300;

/** Mobile filter summary: max number of active labels shown before "+N more". */
export const MOBILE_FILTER_SUMMARY_LABEL_LIMIT = 2;

/** UI: fade duration when swapping loader and live content (milliseconds). */
export const LOADER_FADE_DURATION_MS = 180;

/** Query-string key for dashboard date-range preset (see MentionDateRangePreset). */
export const MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY = "date_range_preset";

/** Shown under date inputs when "from" is after "to". */
export const MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE =
  "Start date must be on or before end date.";

/** Between ISO `date_from` and `date_to` on the date-range popover trigger when preset is custom. */
export const DASHBOARD_DATE_RANGE_TRIGGER_CUSTOM_RANGE_DISPLAY_SEPARATOR = " – ";

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
  groupBy: [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
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

export type MentionGroupByValue = 
  (typeof mentionFilterChoices.groupBy)[number]["value"];

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

export const mentionGroupByValueSet = new Set<string>(
  mentionFilterChoices.groupBy.map((c) => c.value)
);
