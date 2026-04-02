/**
 * Global logic for dashboard **mention filters**: turning `MentionFilters` into URL
 * query params, normalizing after parse, local-calendar date windows, and JSON-safe
 * bodies for the mentions API.
 *
 * **Shared primitives (not mention-specific):** see `choice-display-label.ts`,
 * `local-iso-calendar-date.ts`, and `sorted-url-search-params-string.ts`.
 *
 * **Not here:** React UI, filter form handlers, mobile summary copy, or table chip
 * labels — those live under `components/mention-filters` and `components/mention-table`.
 *
 * **Flow (mental model):** URL → `parseMentionFiltersFromSearchParams` →
 * `normalizeDashboardMentionFiltersAfterParse` (rolling presets get concrete dates) →
 * UI edits → `writeMentionFiltersToSearchParams` / `mentionFiltersToSortedQueryString` →
 * data hooks use `mentionFiltersForApiRequestBody` / `buildMentionFiltersForApi`.
 */
import {
  DATE_PRESET,
  MENTIONED_VALUE,
  MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY,
  MENTION_ROLLING_PRESET_DAY_COUNTS,
  mentionDateRangePresetValueSet,
  mentionModelValueSet,
  mentionSentimentValueSet,
  mentionGroupByValueSet,
} from "@/config";
import type {
  MentionDateRangePreset,
  MentionRollingDateRangePreset,
} from "@/config";
import type { MentionFilters } from "@/models";

import {
  addLocalCalendarDays,
  formatLocalDateAsIsoString,
  isValidIsoCalendarDateString,
} from "@/lib/helpers/local-iso-calendar-date";
import { sortedUrlSearchParamsString } from "@/lib/helpers/sorted-url-search-params-string";

// =============================================================================
// Date range (local calendar)
// =============================================================================

/**
 * Inclusive window in the **local** timezone: `date_to` is the anchor day,
 * `date_from` is anchor minus `(inclusiveDayCount - 1)` days.
 */
export function getMentionDateRangeForInclusiveLocalDayCount(
  anchorDate: Date,
  inclusiveDayCount: number
): Pick<MentionFilters, "date_from" | "date_to"> {
  const dateTo = formatLocalDateAsIsoString(anchorDate);
  const startDate = addLocalCalendarDays(
    anchorDate,
    -(inclusiveDayCount - 1)
  );
  const dateFrom = formatLocalDateAsIsoString(startDate);
  return { date_from: dateFrom, date_to: dateTo };
}

/** Maps a rolling preset (e.g. last 7 days) to concrete `date_from` / `date_to` for `anchorDate`. */
export function getMentionDateRangeForMentionDateRangeRollingPreset(
  anchorDate: Date,
  preset: MentionRollingDateRangePreset
): Pick<MentionFilters, "date_from" | "date_to"> {
  const inclusiveDayCount = MENTION_ROLLING_PRESET_DAY_COUNTS[preset];
  return getMentionDateRangeForInclusiveLocalDayCount(
    anchorDate,
    inclusiveDayCount
  );
}

// =============================================================================
// Date validation
// =============================================================================

/**
 * `true` when both ISO `YYYY-MM-DD` bounds exist and `date_from` is **after** `date_to`
 * (lexicographic compare matches calendar order for this format).
 */
export function isMentionDateRangeOrderInvalid(
  filters: Pick<MentionFilters, "date_from" | "date_to">
): boolean {
  const { date_from: dateFrom, date_to: dateTo } = filters;
  if (!dateFrom || !dateTo) return false;
  return dateFrom > dateTo;
}

/** Payload from the date-range preset popover when the user clicks Apply. */
export type MentionDateRangePopoverApplySelection = {
  preset: MentionDateRangePreset;
  dateFrom?: string;
  dateTo?: string;
};

/**
 * Applies a date-range choice the same way the legacy dashboard handlers did:
 * Maximum clears bounds; rolling presets get concrete local-calendar dates at `anchorDate`;
 * Custom sets `date_from` / `date_to` from the selection.
 */
export function nextMentionFiltersForDateRangeApply(
  currentFilters: MentionFilters,
  selection: MentionDateRangePopoverApplySelection,
  anchorDate: Date
): MentionFilters {
  const { preset, dateFrom, dateTo } = selection;

  if (preset === DATE_PRESET.MAXIMUM) {
    const { date_from: _omitFrom, date_to: _omitTo, ...rest } = currentFilters;
    return {
      ...rest,
      mention_date_range_preset: DATE_PRESET.MAXIMUM,
    };
  }

  if (preset in MENTION_ROLLING_PRESET_DAY_COUNTS) {
    const range = getMentionDateRangeForMentionDateRangeRollingPreset(
      anchorDate,
      preset as MentionRollingDateRangePreset
    );
    return {
      ...currentFilters,
      ...range,
      mention_date_range_preset: preset,
    };
  }

  if (preset === DATE_PRESET.CUSTOM) {
    return {
      ...currentFilters,
      date_from: dateFrom,
      date_to: dateTo,
      mention_date_range_preset: DATE_PRESET.CUSTOM,
    };
  }

  return currentFilters;
}

/** Maps `MentionFilters` into the shape expected by `DateRangePresetPopover`. */
export function mentionFiltersToDateRangePresetPopoverValue(
  filters: MentionFilters
): {
  preset: string;
  dateFrom?: string;
  dateTo?: string;
} {
  return {
    preset: filters.mention_date_range_preset ?? DATE_PRESET.MAXIMUM,
    dateFrom: filters.date_from,
    dateTo: filters.date_to,
  };
}

// =============================================================================
// Dashboard state
// =============================================================================

/** Default filters: full range (Maximum), no facet narrowing. */
export function getDashboardBaselineMentionFilters(): MentionFilters {
  return { mention_date_range_preset: DATE_PRESET.MAXIMUM };
}

/**
 * Aligns in-memory filters after URL parse or UI changes: rolling presets always get
 * both dates; Maximum drops bounds; Custom with empty dates stays Custom; unknown
 * preset with no dates falls back to Maximum.
 */
export function normalizeDashboardMentionFiltersAfterParse(
  filters: MentionFilters,
  anchorDate: Date
): MentionFilters {
  const preset = filters.mention_date_range_preset ?? DATE_PRESET.MAXIMUM;

  if (preset === DATE_PRESET.MAXIMUM) {
    const { date_from: _omitFrom, date_to: _omitTo, ...rest } = filters;
    return {
      ...rest,
      mention_date_range_preset: DATE_PRESET.MAXIMUM,
    };
  }

  if (preset in MENTION_ROLLING_PRESET_DAY_COUNTS) {
    if (filters.date_from === undefined || filters.date_to === undefined) {
      const range = getMentionDateRangeForMentionDateRangeRollingPreset(
        anchorDate,
        preset as MentionRollingDateRangePreset
      );
      return { ...filters, ...range, mention_date_range_preset: preset };
    }
    return { ...filters, mention_date_range_preset: preset };
  }

  if (preset === DATE_PRESET.CUSTOM) {
    return { ...filters, mention_date_range_preset: DATE_PRESET.CUSTOM };
  }

  if (filters.date_from === undefined && filters.date_to === undefined) {
    return {
      ...filters,
      mention_date_range_preset: DATE_PRESET.MAXIMUM,
    };
  }

  return { ...filters, mention_date_range_preset: DATE_PRESET.CUSTOM };
}

/**
 * Shallow equality for sync/debounce: compares model, sentiment, mentioned, dates,
 * preset (missing = Maximum), and `group_by` (missing = `day`).
 */
export function mentionFiltersShallowEqualForDashboard(
  left: MentionFilters,
  right: MentionFilters
): boolean {
  const leftGroupBy = left.group_by ?? "day";
  const rightGroupBy = right.group_by ?? "day";

  return (
    left.model === right.model &&
    left.sentiment === right.sentiment &&
    left.mentioned === right.mentioned &&
    left.date_from === right.date_from &&
    left.date_to === right.date_to &&
    (left.mention_date_range_preset ?? DATE_PRESET.MAXIMUM) ===
      (right.mention_date_range_preset ?? DATE_PRESET.MAXIMUM) &&
    leftGroupBy === rightGroupBy
  );
}

// =============================================================================
// URL (namespace = `""`, `chart_`, `table_`, …)
// =============================================================================

/** Canonical string for comparing filter state (sorted keys and values). */
export function mentionFiltersToSortedQueryString(
  filters: MentionFilters,
  namespace: string = ""
): string {
  const params = mentionFiltersToUrlSearchParams(filters, namespace);
  return sortedUrlSearchParamsString(params);
}

/**
 * Reads namespaced query keys into `MentionFilters`; invalid enum values and bad dates
 * are dropped. Infers `custom` vs `maximum` when preset param is absent.
 */
export function parseMentionFiltersFromSearchParams(
  searchParams: URLSearchParams,
  namespace: string = ""
): MentionFilters {
  const out: MentionFilters = {};

  const modelRaw = searchParams.get(`${namespace}model`);
  if (modelRaw && mentionModelValueSet.has(modelRaw)) {
    out.model = modelRaw as MentionFilters["model"];
  }

  const sentimentRaw = searchParams.get(`${namespace}sentiment`);
  if (sentimentRaw && mentionSentimentValueSet.has(sentimentRaw)) {
    out.sentiment = sentimentRaw as MentionFilters["sentiment"];
  }

  const mentionedRaw = searchParams.get(`${namespace}mentioned`);
  if (mentionedRaw === MENTIONED_VALUE.YES) out.mentioned = true;
  else if (mentionedRaw === MENTIONED_VALUE.NO) out.mentioned = false;

  const groupByRaw = searchParams.get(`${namespace}group_by`);
  if (groupByRaw && mentionGroupByValueSet.has(groupByRaw)) {
    out.group_by = groupByRaw as MentionFilters["group_by"];
  }

  const dateFrom = searchParams.get(`${namespace}date_from`);
  if (dateFrom && isValidIsoCalendarDateString(dateFrom))
    out.date_from = dateFrom;

  const dateTo = searchParams.get(`${namespace}date_to`);
  if (dateTo && isValidIsoCalendarDateString(dateTo))
    out.date_to = dateTo;

  const presetRaw = searchParams.get(
    namespace + MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY
  );
  let preset: MentionDateRangePreset | undefined;
  if (presetRaw && mentionDateRangePresetValueSet.has(presetRaw)) {
    preset = presetRaw as MentionDateRangePreset;
  }

  if (preset === undefined) {
    if (out.date_from !== undefined || out.date_to !== undefined) {
      preset = DATE_PRESET.CUSTOM;
    } else {
      preset = DATE_PRESET.MAXIMUM;
    }
  }

  if (preset === DATE_PRESET.MAXIMUM) {
    delete out.date_from;
    delete out.date_to;
  }

  out.mention_date_range_preset = preset;
  return out;
}

/**
 * Encodes filters under `namespace`; rolling presets emit preset key + optional dates,
 * custom emits dates only, Maximum omits date params.
 */
export function mentionFiltersToUrlSearchParams(
  filters: MentionFilters,
  namespace: string = ""
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.model !== undefined) params.set(`${namespace}model`, filters.model);
  if (filters.sentiment !== undefined)
    params.set(`${namespace}sentiment`, filters.sentiment);
  if (filters.mentioned === true)
    params.set(`${namespace}mentioned`, MENTIONED_VALUE.YES);
  if (filters.mentioned === false)
    params.set(`${namespace}mentioned`, MENTIONED_VALUE.NO);
  if (filters.group_by !== undefined)
    params.set(`${namespace}group_by`, filters.group_by);

  let preset: MentionDateRangePreset =
    (filters.mention_date_range_preset as MentionDateRangePreset) ??
    DATE_PRESET.MAXIMUM;
  if (
    preset === DATE_PRESET.MAXIMUM &&
    (filters.date_from !== undefined || filters.date_to !== undefined)
  ) {
    preset = DATE_PRESET.CUSTOM;
  }

  if (preset in MENTION_ROLLING_PRESET_DAY_COUNTS) {
    params.set(
      namespace + MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY,
      preset
    );
    if (filters.date_from !== undefined)
      params.set(`${namespace}date_from`, filters.date_from);
    if (filters.date_to !== undefined)
      params.set(`${namespace}date_to`, filters.date_to);
  } else if (preset === DATE_PRESET.CUSTOM) {
    if (filters.date_from !== undefined)
      params.set(`${namespace}date_from`, filters.date_from);
    if (filters.date_to !== undefined)
      params.set(`${namespace}date_to`, filters.date_to);
  }

  return params;
}

/** Replaces every key starting with `namespace`, then merges the new filter params. */
export function writeMentionFiltersToSearchParams(
  existingParams: URLSearchParams,
  filters: MentionFilters,
  namespace: string
): URLSearchParams {
  const nextParams = new URLSearchParams(existingParams.toString());

  const keysToDelete = Array.from(nextParams.keys()).filter((key) =>
    key.startsWith(namespace)
  );
  for (const key of keysToDelete) {
    nextParams.delete(key);
  }

  const newParams = mentionFiltersToUrlSearchParams(filters, namespace);
  newParams.forEach((value, key) => {
    nextParams.set(key, value);
  });

  return nextParams;
}

// =============================================================================
// API payload (mentions POST / chart requests)
// =============================================================================

/** Keys the backend does not accept on the filter body (UI / chart-only). */
const MENTION_FILTER_KEYS_EXCLUDED_FROM_API_REQUEST_BODY = new Set([
  "mention_date_range_preset",
  "group_by",
]);

/**
 * Removes invalid date pairs, strips client-only `mention_date_range_preset` and
 * `group_by` from the object used toward API filter arguments.
 */
export function buildMentionFiltersForApi(
  filters: MentionFilters
): MentionFilters {
  let next: MentionFilters = { ...filters };
  if (isMentionDateRangeOrderInvalid(next)) {
    const { date_from: _omitFrom, date_to: _omitTo, ...rest } = next;
    next = rest;
  }

  const {
    mention_date_range_preset: _omitPreset,
    group_by: _omitGroupBy,
    ...forApi
  } = next;
  return forApi;
}

/**
 * JSON body helper: drops `undefined` values and excluded keys; returns `undefined`
 * when nothing would be sent (empty filter object).
 */
export function mentionFiltersForApiRequestBody(
  filters: MentionFilters
): MentionFilters | undefined {
  const definedOnly = Object.fromEntries(
    Object.entries(filters).filter(
      ([key, value]) =>
        value !== undefined &&
        !MENTION_FILTER_KEYS_EXCLUDED_FROM_API_REQUEST_BODY.has(key)
    )
  ) as MentionFilters;
  return Object.keys(definedOnly).length > 0 ? definedOnly : undefined;
}
