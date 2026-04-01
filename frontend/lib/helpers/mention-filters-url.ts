import {
  DATE_PRESET,
  MENTIONED_VALUE,
  MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY,
  MENTION_ROLLING_PRESET_DAY_COUNTS,
  mentionDateRangePresetValueSet,
  mentionModelValueSet,
  mentionSentimentValueSet,
} from "@/config";
import type { MentionFilters } from "@/models";
import type { MentionDateRangePreset } from "@/config";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Returns true when value is a real calendar date in YYYY-MM-DD format. */
function isValidIsoCalendarDateStringForMentionFilter(value: string): boolean {
  if (!ISO_DATE_REGEX.test(value)) return false;
  const [yearString, monthString, dayString] = value.split("-");
  const year = Number(yearString);
  const monthIndex = Number(monthString) - 1;
  const day = Number(dayString);
  const parsed = new Date(year, monthIndex, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === monthIndex &&
    parsed.getDate() === day
  );
}

/** Stable query string for comparison (sorted keys, sorted duplicate values). */
export function mentionFiltersToSortedQueryString(filters: MentionFilters): string {
  const params = mentionFiltersToUrlSearchParams(filters);
  return sortedUrlSearchParamsString(params);
}

/** Serialises URLSearchParams into a deterministic string (keys and values sorted alphabetically). */
export function sortedUrlSearchParamsString(params: URLSearchParams): string {
  const entries: [string, string][] = [];
  params.forEach((value, key) => {
    entries.push([key, value]);
  });
  entries.sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])));
  return new URLSearchParams(entries).toString();
}

/** Converts a MentionFilters object into URLSearchParams, encoding date-range preset logic. */
export function mentionFiltersToUrlSearchParams(
  filters: MentionFilters
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.model !== undefined) params.set("model", filters.model);
  if (filters.sentiment !== undefined)
    params.set("sentiment", filters.sentiment);
  if (filters.mentioned === true) params.set("mentioned", MENTIONED_VALUE.YES);
  if (filters.mentioned === false) params.set("mentioned", MENTIONED_VALUE.NO);

  let preset: MentionDateRangePreset =
    (filters.mention_date_range_preset as MentionDateRangePreset) ?? DATE_PRESET.MAXIMUM;
  if (
    preset === DATE_PRESET.MAXIMUM &&
    (filters.date_from !== undefined || filters.date_to !== undefined)
  ) {
    preset = DATE_PRESET.CUSTOM;
  }

  if (preset in MENTION_ROLLING_PRESET_DAY_COUNTS) {
    params.set(
      MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY,
      preset
    );
    if (filters.date_from !== undefined)
      params.set("date_from", filters.date_from);
    if (filters.date_to !== undefined) params.set("date_to", filters.date_to);
  } else if (preset === DATE_PRESET.CUSTOM) {
    if (filters.date_from !== undefined)
      params.set("date_from", filters.date_from);
    if (filters.date_to !== undefined) params.set("date_to", filters.date_to);
  }
  // maximum: omit dates and preset query key for a clean default URL

  return params;
}

/** Parses URLSearchParams back into a validated MentionFilters object, falling back to safe defaults. */
export function parseMentionFiltersFromSearchParams(
  searchParams: URLSearchParams
): MentionFilters {
  const out: MentionFilters = {};

  const modelRaw = searchParams.get("model");
  if (modelRaw && mentionModelValueSet.has(modelRaw)) {
    out.model = modelRaw as MentionFilters["model"];
  }

  const sentimentRaw = searchParams.get("sentiment");
  if (
    sentimentRaw &&
    mentionSentimentValueSet.has(sentimentRaw)
  ) {
    out.sentiment = sentimentRaw as MentionFilters["sentiment"];
  }

  const mentionedRaw = searchParams.get("mentioned");
  if (mentionedRaw === MENTIONED_VALUE.YES) out.mentioned = true;
  else if (mentionedRaw === MENTIONED_VALUE.NO) out.mentioned = false;

  const dateFrom = searchParams.get("date_from");
  if (dateFrom && isValidIsoCalendarDateStringForMentionFilter(dateFrom))
    out.date_from = dateFrom;

  const dateTo = searchParams.get("date_to");
  if (dateTo && isValidIsoCalendarDateStringForMentionFilter(dateTo))
    out.date_to = dateTo;

  const presetRaw = searchParams.get(
    MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY
  );
  let preset: MentionDateRangePreset | undefined;
  if (
    presetRaw &&
    mentionDateRangePresetValueSet.has(presetRaw)
  ) {
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
