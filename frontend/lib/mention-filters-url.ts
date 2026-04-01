import { MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY } from "@/config";
import type { MentionDateRangePreset, MentionFilters } from "@/models";

const ROLLING_DATE_RANGE_PRESET_SET = new Set<MentionDateRangePreset>([
  "last_3_days",
  "last_7_days",
  "last_30_days",
]);

const VALID_MENTION_DATE_RANGE_PRESET_FROM_URL = new Set<MentionDateRangePreset>(
  ["maximum", "last_3_days", "last_7_days", "last_30_days", "custom"]
);

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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

const VALID_MODELS = new Set<MentionFilters["model"]>([
  "chatgpt",
  "claude",
  "gemini",
  "perplexity",
]);

const VALID_SENTIMENTS = new Set<MentionFilters["sentiment"]>([
  "positive",
  "neutral",
  "negative",
]);

/** Stable query string for comparison (sorted keys, sorted duplicate values). */
export function mentionFiltersToSortedQueryString(filters: MentionFilters): string {
  const params = mentionFiltersToUrlSearchParams(filters);
  return sortedUrlSearchParamsString(params);
}

export function sortedUrlSearchParamsString(params: URLSearchParams): string {
  const entries: [string, string][] = [];
  params.forEach((value, key) => {
    entries.push([key, value]);
  });
  entries.sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])));
  return new URLSearchParams(entries).toString();
}

export function mentionFiltersToUrlSearchParams(
  filters: MentionFilters
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.model !== undefined) params.set("model", filters.model);
  if (filters.sentiment !== undefined)
    params.set("sentiment", filters.sentiment);
  if (filters.mentioned === true) params.set("mentioned", "true");
  if (filters.mentioned === false) params.set("mentioned", "false");

  let preset: MentionDateRangePreset =
    filters.mention_date_range_preset ?? "maximum";
  if (
    preset === "maximum" &&
    (filters.date_from !== undefined || filters.date_to !== undefined)
  ) {
    preset = "custom";
  }

  if (ROLLING_DATE_RANGE_PRESET_SET.has(preset)) {
    params.set(
      MENTION_FILTER_DATE_RANGE_PRESET_QUERY_KEY,
      preset
    );
    if (filters.date_from !== undefined)
      params.set("date_from", filters.date_from);
    if (filters.date_to !== undefined) params.set("date_to", filters.date_to);
  } else if (preset === "custom") {
    if (filters.date_from !== undefined)
      params.set("date_from", filters.date_from);
    if (filters.date_to !== undefined) params.set("date_to", filters.date_to);
  }
  // maximum: omit dates and preset query key for a clean default URL

  return params;
}

export function parseMentionFiltersFromSearchParams(
  searchParams: URLSearchParams
): MentionFilters {
  const out: MentionFilters = {};

  const modelRaw = searchParams.get("model");
  if (modelRaw && VALID_MODELS.has(modelRaw as MentionFilters["model"])) {
    out.model = modelRaw as MentionFilters["model"];
  }

  const sentimentRaw = searchParams.get("sentiment");
  if (
    sentimentRaw &&
    VALID_SENTIMENTS.has(sentimentRaw as MentionFilters["sentiment"])
  ) {
    out.sentiment = sentimentRaw as MentionFilters["sentiment"];
  }

  const mentionedRaw = searchParams.get("mentioned");
  if (mentionedRaw === "true") out.mentioned = true;
  else if (mentionedRaw === "false") out.mentioned = false;

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
    VALID_MENTION_DATE_RANGE_PRESET_FROM_URL.has(
      presetRaw as MentionDateRangePreset
    )
  ) {
    preset = presetRaw as MentionDateRangePreset;
  }

  if (preset === undefined) {
    if (out.date_from !== undefined || out.date_to !== undefined) {
      preset = "custom";
    } else {
      preset = "maximum";
    }
  }

  if (preset === "maximum") {
    delete out.date_from;
    delete out.date_to;
  }

  out.mention_date_range_preset = preset;
  return out;
}
