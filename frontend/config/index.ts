export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const DEFAULT_PAGE_SIZE = 25;

/** Default granularity for `/mentions/trends` requests. */
export const TRENDS_DEFAULT_GROUP_BY = "day" as const;

/** SWR: skip duplicate in-flight requests within this window (milliseconds). */
export const SWR_DEDUPING_INTERVAL_MS = 2000;

/** Dashboard filter controls: delay before mentions/trends refetch (milliseconds). */
export const MENTION_FILTER_DEBOUNCE_INTERVAL_MS = 300;

/** Shown under date inputs when "from" is after "to". */
export const MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE =
  "Start date must be on or before end date.";
