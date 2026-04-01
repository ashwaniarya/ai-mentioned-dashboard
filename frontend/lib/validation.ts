import type { MentionFilters } from "@/models";

const MENTION_FILTER_KEYS_EXCLUDED_FROM_API_REQUEST_BODY = new Set([
  "mention_date_range_preset",
]);

/** True when both ISO dates are set and start is after end (YYYY-MM-DD compares lexicographically). */
export function isMentionDateRangeOrderInvalid(
  filters: Pick<MentionFilters, "date_from" | "date_to">
): boolean {
  const { date_from: dateFrom, date_to: dateTo } = filters;
  if (!dateFrom || !dateTo) return false;
  return dateFrom > dateTo;
}

/**
 * Drops invalid date pairs. Omits date bounds when both dates are missing (Maximum / unbounded).
 * Strips client-only `mention_date_range_preset` from the result.
 */
export function buildMentionFiltersForApi(
  filters: MentionFilters
): MentionFilters {
  let next: MentionFilters = { ...filters };
  if (isMentionDateRangeOrderInvalid(next)) {
    const { date_from: _omitFrom, date_to: _omitTo, ...rest } = next;
    next = rest;
  }

  const { mention_date_range_preset: _omitPreset, ...forApi } = next;
  return forApi;
}

/** Strips undefined fields; returns `undefined` when no filter keys remain (mentions POST body). */
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
