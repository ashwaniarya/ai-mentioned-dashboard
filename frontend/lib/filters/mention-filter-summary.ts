import {
  DATE_PRESET,
  MENTIONED_VALUE,
  MOBILE_FILTER_SUMMARY_LABEL_LIMIT,
  labelForValue,
  mentionFilterChoices,
} from "@/config";
import type { MentionDateRangePreset } from "@/config";
import type { MentionFilters } from "@/models";

import { mentionFiltersShallowEqualForDashboard } from "./mention-filter-default-date-range";

interface MentionFilterSummaryInput {
  filters: MentionFilters;
  dashboardBaselineMentionFilters: MentionFilters;
}

export interface MentionFilterSummaryResult {
  hasActiveFilters: boolean;
  activeFilterLabels: string[];
  mobileSummaryText: string;
  mobileActiveFilterText: string;
}

function isMentionDateRangeActiveComparedToBaseline(
  filters: MentionFilters,
  dashboardBaselineMentionFilters: MentionFilters
) {
  const selectedDateRangePreset =
    (filters.mention_date_range_preset ??
      DATE_PRESET.MAXIMUM) as MentionDateRangePreset;
  const baselineDateRangePreset =
    (dashboardBaselineMentionFilters.mention_date_range_preset ??
      DATE_PRESET.MAXIMUM) as MentionDateRangePreset;

  return (
    filters.date_from !== dashboardBaselineMentionFilters.date_from ||
    filters.date_to !== dashboardBaselineMentionFilters.date_to ||
    selectedDateRangePreset !== baselineDateRangePreset
  );
}

function getActiveMentionFilterLabels(
  filters: MentionFilters,
  dashboardBaselineMentionFilters: MentionFilters
) {
  const activeFilterLabels: string[] = [];
  const mentionDateRangePresetSelectValue =
    (filters.mention_date_range_preset ??
      DATE_PRESET.MAXIMUM) as MentionDateRangePreset;

  if (
    isMentionDateRangeActiveComparedToBaseline(
      filters,
      dashboardBaselineMentionFilters
    )
  ) {
    activeFilterLabels.push(
      labelForValue(
        mentionFilterChoices.dateRange,
        mentionDateRangePresetSelectValue
      )
    );
  }

  if (filters.model) {
    activeFilterLabels.push(
      labelForValue(mentionFilterChoices.model, filters.model)
    );
  }

  if (filters.sentiment) {
    activeFilterLabels.push(
      labelForValue(mentionFilterChoices.sentiment, filters.sentiment)
    );
  }

  if (filters.mentioned !== undefined) {
    activeFilterLabels.push(
      labelForValue(
        mentionFilterChoices.mentioned,
        filters.mentioned ? MENTIONED_VALUE.YES : MENTIONED_VALUE.NO
      )
    );
  }

  return activeFilterLabels;
}

function getMobileMentionFilterSummaryText(activeFilterLabels: string[]) {
  if (activeFilterLabels.length === 0) return "All filters";

  const visibleFilterLabels = activeFilterLabels.slice(
    0,
    MOBILE_FILTER_SUMMARY_LABEL_LIMIT
  );
  const hiddenFilterLabelCount =
    activeFilterLabels.length - MOBILE_FILTER_SUMMARY_LABEL_LIMIT;

  return hiddenFilterLabelCount > 0
    ? `${visibleFilterLabels.join(" • ")} • +${hiddenFilterLabelCount} more`
    : visibleFilterLabels.join(" • ");
}

export function getMentionFilterSummary({
  filters,
  dashboardBaselineMentionFilters,
}: MentionFilterSummaryInput): MentionFilterSummaryResult {
  const hasActiveFilters = !mentionFiltersShallowEqualForDashboard(
    filters,
    dashboardBaselineMentionFilters
  );
  const activeFilterLabels = getActiveMentionFilterLabels(
    filters,
    dashboardBaselineMentionFilters
  );

  return {
    hasActiveFilters,
    activeFilterLabels,
    mobileSummaryText: getMobileMentionFilterSummaryText(activeFilterLabels),
    mobileActiveFilterText: hasActiveFilters
      ? `${activeFilterLabels.length} active`
      : "Default view",
  };
}

export {
  getActiveMentionFilterLabels,
  getMobileMentionFilterSummaryText,
  isMentionDateRangeActiveComparedToBaseline,
};
