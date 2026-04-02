import { DATE_PRESET, MENTION_ROLLING_PRESET_DAY_COUNTS } from "@/config";
import type { MentionRollingDateRangePreset } from "@/config";
import type { MentionFilters } from "@/models";
import type { MentionDateRangePreset } from "@/config";

/** YYYY-MM-DD in the local calendar of `anchorDate`. */
function formatLocalDateForMentionFilter(anchorDate: Date): string {
  const year = anchorDate.getFullYear();
  const month = String(anchorDate.getMonth() + 1).padStart(2, "0");
  const day = String(anchorDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Shifts `anchorDate` by `deltaDays` (local calendar). */
function addLocalCalendarDaysForMentionFilter(
  anchorDate: Date,
  deltaDays: number
): Date {
  const next = new Date(anchorDate);
  next.setDate(next.getDate() + deltaDays);
  return next;
}

/**
 * Inclusive window: `date_to` = anchor day, `date_from` = anchor minus (inclusiveDayCount - 1).
 * Example: inclusive 3 → today and the two previous local days.
 */
export function getMentionDateRangeForInclusiveLocalDayCount(
  anchorDate: Date,
  inclusiveDayCount: number
): Pick<MentionFilters, "date_from" | "date_to"> {
  const dateTo = formatLocalDateForMentionFilter(anchorDate);
  const startDate = addLocalCalendarDaysForMentionFilter(
    anchorDate,
    -(inclusiveDayCount - 1)
  );
  const dateFrom = formatLocalDateForMentionFilter(startDate);
  return { date_from: dateFrom, date_to: dateTo };
}

/** Resolves a rolling preset (e.g. last-7-days) into concrete date_from / date_to using the anchor date. */
export function getMentionDateRangeForMentionDateRangeRollingPreset(
  anchorDate: Date,
  preset: MentionRollingDateRangePreset
): Pick<MentionFilters, "date_from" | "date_to"> {
  const inclusiveDayCount =
    MENTION_ROLLING_PRESET_DAY_COUNTS[preset];
  return getMentionDateRangeForInclusiveLocalDayCount(
    anchorDate,
    inclusiveDayCount
  );
}

/** Baseline dashboard filters: Maximum range (no dates), facets cleared. */
export function getDashboardBaselineMentionFilters(): MentionFilters {
  return { mention_date_range_preset: DATE_PRESET.MAXIMUM };
}

/**
 * After URL parse or UI change, ensure rolling presets have both dates; Maximum has none.
 * Custom with no dates is kept so the user can open From/To after choosing Custom.
 * Unknown preset with no dates collapses to Maximum.
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

/** Shallow-compares two MentionFilters for dashboard-relevant equality (treats missing preset as MAXIMUM). */
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
