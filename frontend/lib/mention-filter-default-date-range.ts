import { MENTION_FILTER_DATE_RANGE_PRESET_INCLUSIVE_DAY_COUNT_BY_PRESET } from "@/config";
import type { MentionDateRangePreset, MentionFilters } from "@/models";

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

export function getMentionDateRangeForMentionDateRangeRollingPreset(
  anchorDate: Date,
  preset: Extract<
    MentionDateRangePreset,
    "last_3_days" | "last_7_days" | "last_30_days"
  >
): Pick<MentionFilters, "date_from" | "date_to"> {
  const inclusiveDayCount =
    MENTION_FILTER_DATE_RANGE_PRESET_INCLUSIVE_DAY_COUNT_BY_PRESET[preset];
  return getMentionDateRangeForInclusiveLocalDayCount(
    anchorDate,
    inclusiveDayCount
  );
}

/** Baseline dashboard filters: Maximum range (no dates), facets cleared. */
export function getDashboardBaselineMentionFilters(): MentionFilters {
  return { mention_date_range_preset: "maximum" };
}

/**
 * After URL parse, ensure rolling presets have both dates; Maximum has none;
 * both dates empty implies Maximum.
 */
export function normalizeDashboardMentionFiltersAfterParse(
  filters: MentionFilters,
  anchorDate: Date
): MentionFilters {
  const preset = filters.mention_date_range_preset ?? "maximum";

  if (preset === "maximum") {
    const { date_from: _omitFrom, date_to: _omitTo, ...rest } = filters;
    return {
      ...rest,
      mention_date_range_preset: "maximum",
    };
  }

  if (
    preset === "last_3_days" ||
    preset === "last_7_days" ||
    preset === "last_30_days"
  ) {
    if (filters.date_from === undefined || filters.date_to === undefined) {
      const range = getMentionDateRangeForMentionDateRangeRollingPreset(
        anchorDate,
        preset
      );
      return { ...filters, ...range, mention_date_range_preset: preset };
    }
    return { ...filters, mention_date_range_preset: preset };
  }

  if (filters.date_from === undefined && filters.date_to === undefined) {
    return {
      ...filters,
      mention_date_range_preset: "maximum",
    };
  }

  return { ...filters, mention_date_range_preset: "custom" };
}

export function mentionFiltersShallowEqualForDashboard(
  left: MentionFilters,
  right: MentionFilters
): boolean {
  return (
    left.model === right.model &&
    left.sentiment === right.sentiment &&
    left.mentioned === right.mentioned &&
    left.date_from === right.date_from &&
    left.date_to === right.date_to &&
    (left.mention_date_range_preset ?? "maximum") ===
      (right.mention_date_range_preset ?? "maximum")
  );
}
