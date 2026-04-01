import type { MentionFilters } from "@/models";

/** True when both ISO dates are set and start is after end (YYYY-MM-DD compares lexicographically). */
export function isMentionDateRangeOrderInvalid(
  filters: Pick<MentionFilters, "date_from" | "date_to">
): boolean {
  const { date_from: dateFrom, date_to: dateTo } = filters;
  if (!dateFrom || !dateTo) return false;
  return dateFrom > dateTo;
}

/** Drops date fields when the range is invalid so SWR never sends contradictory dates. */
export function buildMentionFiltersForApi(filters: MentionFilters): MentionFilters {
  if (isMentionDateRangeOrderInvalid(filters)) {
    const { date_from: _omitFrom, date_to: _omitTo, ...rest } = filters;
    return rest;
  }
  return { ...filters };
}

/** Strips undefined fields; returns `undefined` when no filter keys remain (mentions POST body). */
export function mentionFiltersForApiRequestBody(
  filters: MentionFilters
): MentionFilters | undefined {
  const definedOnly = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined)
  ) as MentionFilters;
  return Object.keys(definedOnly).length > 0 ? definedOnly : undefined;
}
