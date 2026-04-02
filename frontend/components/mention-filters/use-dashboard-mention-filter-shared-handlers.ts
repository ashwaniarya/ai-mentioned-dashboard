"use client";

import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { MentionFilters } from "@/models";
import { FACET } from "@/config";
import type { MentionDateRangePreset } from "@/config";
import {
  getDashboardBaselineMentionFilters,
  isMentionDateRangeOrderInvalid,
  nextMentionFiltersForDateRangeApply,
  normalizeDashboardMentionFiltersAfterParse,
} from "@/lib/helpers/mention-filters";
import type { DateRangePresetPopoverCommittedValue } from "@/components/date-range/date-range-preset-popover";

export const dashboardMentionFilterFieldLabelClasses =
  "block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5";

/**
 * Muted field shell (border, background, focus-within ring) for dashboard filter rows:
 * date range + From/To, segment controls, and as the visual chrome for dashboard SelectTrigger.
 */
export const dashboardMentionFilterCombinedFieldShellClasses =
  "rounded-lg border border-border/50 bg-muted/20 outline-none transition-all duration-200 hover:bg-muted/40 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 overflow-hidden";

/** Flex row: leading label or icon column + control (gap-0; shell on the outer div). */
export const dashboardMentionFilterCombinedFieldFlexRowClasses =
  "flex w-full min-w-0 flex-row flex-nowrap items-center gap-0";

/** Leading column for short visible text (e.g. From / To) inside the combined shell. */
export const dashboardMentionFilterVisibleDateRangeLabelCellClasses =
  "flex min-h-9 min-w-[2.75rem] shrink-0 items-center justify-center px-1.5 text-center text-xs font-medium leading-none text-muted-foreground";

/**
 * Dashboard SelectTrigger: full shell on the trigger (replaces the old outer wrapper + transparent interior).
 */
export const dashboardMentionFilterSelectTriggerClasses = cn(
  "w-full min-w-0 min-h-9 h-9 py-1 pl-2 pr-2 shadow-none data-[size=default]:h-9 dark:bg-muted/20 dark:hover:bg-muted/40",
  dashboardMentionFilterCombinedFieldShellClasses
);

/**
 * Interior controls inside dashboardMentionFilterCombinedFieldShellClasses: no own border or ring
 * (the shell provides border, background, and focus-within ring). Used for date inputs and radiogroups.
 */
export const dashboardMentionFilterInputContainerClasses =
  "h-9 min-h-9 data-[size=default]:h-9 rounded-none border-0 bg-transparent py-1 px-3 shadow-none transition-colors focus-visible:border-transparent focus-visible:ring-0 aria-invalid:border-transparent aria-invalid:ring-0 dark:aria-invalid:border-transparent dark:aria-invalid:ring-0";

/** Single horizontal row for reset + date preset (and for Custom From/To) at all breakpoints. */
export const dashboardMentionFilterHorizontalControlRowClasses =
  "flex flex-row flex-nowrap items-center gap-3 w-full min-w-0 sm:w-auto sm:flex-1";

/** Grows within a horizontal filter row; min-w-0 allows flex children to shrink on narrow viewports. */
export const dashboardMentionFilterFlexibleFieldClasses = "min-w-0 flex-1";

/** Stable test id: date-range popover trigger on table/chart filters. */
export const dashboardMentionDateRangePopoverTriggerTestId =
  "dashboard-mention-date-range-popover-trigger";

/** Stable test id: date-range popover surface (presets + optional custom fields). */
export const dashboardMentionDateRangePopoverContentTestId =
  "dashboard-mention-date-range-popover-content";

/**
 * Trend chart "Group by" radiogroup: selected segment thumb.
 * Uses design-tokens.css semantic vars (alias → --primary / --primary-foreground).
 */
export const dashboardChartGroupBySegmentSelectedButtonClasses =
  "bg-[var(--dashboard-chart-group-by-segment-selected-background)] text-[var(--dashboard-chart-group-by-segment-selected-foreground)] shadow-sm";

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

  const handleMentionDateRangePopoverApply = useCallback(
    (next: DateRangePresetPopoverCommittedValue) => {
      onFiltersChange(
        nextMentionFiltersForDateRangeApply(
          filters,
          {
            preset: next.preset as MentionDateRangePreset,
            dateFrom: next.dateFrom,
            dateTo: next.dateTo,
          },
          new Date()
        )
      );
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
    handleMentionDateRangePopoverApply,
    handleModelChange,
    handleSentimentChange,
    handleResetDashboardMentionFilters,
  };
}
