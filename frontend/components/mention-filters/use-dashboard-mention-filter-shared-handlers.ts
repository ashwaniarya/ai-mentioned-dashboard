"use client";

import { useCallback, useMemo } from "react";
import type { MentionFilters } from "@/models";
import {
  DATE_PRESET,
  FACET,
  MENTION_ROLLING_PRESET_DAY_COUNTS,
} from "@/config";
import type { MentionDateRangePreset, MentionRollingDateRangePreset } from "@/config";
import {
  getDashboardBaselineMentionFilters,
  getMentionDateRangeForMentionDateRangeRollingPreset,
  isMentionDateRangeOrderInvalid,
  normalizeDashboardMentionFiltersAfterParse,
} from "@/lib/helpers/mention-filters";

export const dashboardMentionFilterFieldLabelClasses =
  "block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5";

export const dashboardMentionFilterInputContainerClasses =
  "h-9 min-h-9 data-[size=default]:h-9 py-1 px-3 bg-muted/20 hover:bg-muted/40 transition-colors border-border/50";

export interface UseDashboardMentionFilterSharedHandlersParams {
  filters: MentionFilters;
  onFiltersChange: (filters: MentionFilters) => void;
}

export function useDashboardMentionFilterSharedHandlers({
  filters,
  onFiltersChange,
}: UseDashboardMentionFilterSharedHandlersParams) {
  const normalizedDashboardBaselineMentionFilters = useMemo(
    () =>
      normalizeDashboardMentionFiltersAfterParse(
        getDashboardBaselineMentionFilters(),
        new Date()
      ),
    []
  );

  const dateRangeOrderInvalid = isMentionDateRangeOrderInvalid(filters);
  const mentionDateRangePresetSelectValue =
    (filters.mention_date_range_preset ?? DATE_PRESET.MAXIMUM) as MentionDateRangePreset;

  const handleDatePresetChange = useCallback(
    (preset: MentionDateRangePreset) => {
      const anchorDate = new Date();
      if (preset === DATE_PRESET.MAXIMUM) {
        onFiltersChange({
          ...filters,
          date_from: undefined,
          date_to: undefined,
          mention_date_range_preset: DATE_PRESET.MAXIMUM,
        });
        return;
      }
      if (preset === DATE_PRESET.CUSTOM) {
        onFiltersChange({
          ...filters,
          mention_date_range_preset: DATE_PRESET.CUSTOM,
        });
        return;
      }
      if (preset in MENTION_ROLLING_PRESET_DAY_COUNTS) {
        const range = getMentionDateRangeForMentionDateRangeRollingPreset(
          anchorDate,
          preset as MentionRollingDateRangePreset
        );
        onFiltersChange({
          ...filters,
          ...range,
          mention_date_range_preset: preset,
        });
      }
    },
    [filters, onFiltersChange]
  );

  const handleDateFromChange = useCallback(
    (rawValue: string) => {
      const dateFrom = rawValue || undefined;
      const bothMissing = !dateFrom && !filters.date_to;
      onFiltersChange({
        ...filters,
        date_from: dateFrom,
        mention_date_range_preset: bothMissing
          ? DATE_PRESET.MAXIMUM
          : DATE_PRESET.CUSTOM,
      });
    },
    [filters, onFiltersChange]
  );

  const handleDateToChange = useCallback(
    (rawValue: string) => {
      const dateTo = rawValue || undefined;
      const bothMissing = !filters.date_from && !dateTo;
      onFiltersChange({
        ...filters,
        date_to: dateTo,
        mention_date_range_preset: bothMissing
          ? DATE_PRESET.MAXIMUM
          : DATE_PRESET.CUSTOM,
      });
    },
    [filters, onFiltersChange]
  );

  const handleModelChange = useCallback(
    (value: string | null) => {
      if (value === null) return;
      onFiltersChange({
        ...filters,
        model:
          value === FACET.ALL ? undefined : (value as MentionFilters["model"]),
      });
    },
    [filters, onFiltersChange]
  );

  const handleSentimentChange = useCallback(
    (value: string | null) => {
      if (value === null) return;
      onFiltersChange({
        ...filters,
        sentiment:
          value === FACET.ALL
            ? undefined
            : (value as MentionFilters["sentiment"]),
      });
    },
    [filters, onFiltersChange]
  );

  const handleResetDashboardMentionFilters = useCallback(() => {
    onFiltersChange(
      normalizeDashboardMentionFiltersAfterParse(
        getDashboardBaselineMentionFilters(),
        new Date()
      )
    );
  }, [onFiltersChange]);

  return {
    normalizedDashboardBaselineMentionFilters,
    dateRangeOrderInvalid,
    mentionDateRangePresetSelectValue,
    handleDatePresetChange,
    handleDateFromChange,
    handleDateToChange,
    handleModelChange,
    handleSentimentChange,
    handleResetDashboardMentionFilters,
  };
}
