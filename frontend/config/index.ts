export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const DEFAULT_PAGE_SIZE = 25;

/** Default granularity for `/mentions/trends` requests. */
export const TRENDS_DEFAULT_GROUP_BY = "day" as const;

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

export * from "./mention-filter-labels";
export * from "../lib/filters/mention-filter-label-helpers";
