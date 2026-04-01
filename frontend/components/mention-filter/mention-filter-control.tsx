"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isMentionDateRangeOrderInvalid } from "@/lib/helpers/mention-filter-api";
import {
  getMentionDateRangeForMentionDateRangeRollingPreset,
} from "@/lib/helpers/mention-filter-default-date-range";
import { getMentionFilterSummary } from "@/lib/helpers/mention-filter-summary";
import type { MentionFilters } from "@/models";
import {
  DATE_PRESET,
  MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE,
  MENTION_ROLLING_PRESET_DAY_COUNTS,
} from "@/config";
import type { MentionDateRangePreset, MentionRollingDateRangePreset } from "@/config";
import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";

import { MentionFilterFieldGroup } from "@/components/mention-filter/mention-filter-field-group";

export interface MentionFilterControlProps {
  filters: MentionFilters;
  onFiltersChange: (filters: MentionFilters) => void;
  /** Default date range + cleared facet filters; used for Reset and disabled state. */
  dashboardBaselineMentionFilters: MentionFilters;
}

export function MentionFilterControl({
  filters,
  onFiltersChange,
  dashboardBaselineMentionFilters,
}: MentionFilterControlProps) {
  const [isMobileFilterExpanded, setIsMobileFilterExpanded] = useState(false);

  const updateFilter = <K extends keyof MentionFilters>(
    key: K,
    value: MentionFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleMentionDateRangePresetSelectChange = (
    preset: MentionDateRangePreset
  ) => {
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
  };

  const handleDateFromInputChange = (rawValue: string) => {
    const dateFrom = rawValue || undefined;
    const dateTo = filters.date_to;
    const bothDateBoundsMissing = !dateFrom && !dateTo;
    onFiltersChange({
      ...filters,
      date_from: dateFrom,
      mention_date_range_preset: bothDateBoundsMissing
        ? DATE_PRESET.MAXIMUM
        : DATE_PRESET.CUSTOM,
    });
  };

  const handleDateToInputChange = (rawValue: string) => {
    const dateTo = rawValue || undefined;
    const dateFrom = filters.date_from;
    const bothDateBoundsMissing = !dateFrom && !dateTo;
    onFiltersChange({
      ...filters,
      date_to: dateTo,
      mention_date_range_preset: bothDateBoundsMissing
        ? DATE_PRESET.MAXIMUM
        : DATE_PRESET.CUSTOM,
    });
  };

  const handleReset = () => {
    onFiltersChange({ ...dashboardBaselineMentionFilters });
  };

  const dateRangeOrderInvalid = isMentionDateRangeOrderInvalid(filters);
  const mentionDateRangePresetSelectValue =
    (filters.mention_date_range_preset ??
      DATE_PRESET.MAXIMUM) as MentionDateRangePreset;
  const filterSummary = getMentionFilterSummary({
    filters,
    dashboardBaselineMentionFilters,
  });
  const mobileFilterPanelId = "mobile-mention-filter-panel";

  return (
    <div className="w-full min-w-0">
      <div className="sm:hidden">
        <Button
          type="button"
          variant="outline"
          aria-expanded={isMobileFilterExpanded}
          aria-controls={mobileFilterPanelId}
          onClick={() => setIsMobileFilterExpanded((previous) => !previous)}
          className="flex h-auto min-h-11 w-full items-start justify-between gap-3 whitespace-normal rounded-xl border-border/70 px-3 py-3 text-left"
        >
          <span className="flex min-w-0 items-start gap-2.5">
            <SlidersHorizontal className="mt-0.5 size-4 text-muted-foreground" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                Filters
              </span>
              <span className="block text-xs text-muted-foreground">
                {filterSummary.mobileActiveFilterText}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {filterSummary.mobileSummaryText}
              </span>
            </span>
          </span>
          <ChevronDown
            className={cn(
              "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              isMobileFilterExpanded ? "rotate-180" : "rotate-0"
            )}
          />
        </Button>

        {isMobileFilterExpanded ? (
          <div
            id={mobileFilterPanelId}
            className="mt-3 space-y-3 rounded-xl border border-border/70 bg-background/95 p-3 shadow-sm"
          >
            <div className="grid grid-cols-1 gap-3">
              <MentionFilterFieldGroup
                filters={filters}
                mentionDateRangePresetSelectValue={
                  mentionDateRangePresetSelectValue
                }
                dateRangeOrderInvalid={dateRangeOrderInvalid}
                onMentionDateRangePresetSelectChange={
                  handleMentionDateRangePresetSelectChange
                }
                onDateFromInputChange={handleDateFromInputChange}
                onDateToInputChange={handleDateToInputChange}
                onModelChange={(value) => updateFilter("model", value)}
                onSentimentChange={(value) => updateFilter("sentiment", value)}
                onMentionedChange={(value) => updateFilter("mentioned", value)}
              />
            </div>

            {dateRangeOrderInvalid ? (
              <p className="text-sm text-destructive" role="alert">
                {MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE}
              </p>
            ) : null}

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!filterSummary.hasActiveFilters}
              className="min-h-11 w-full sm:min-h-8"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        ) : null}
      </div>

      <div className="hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <MentionFilterFieldGroup
          filters={filters}
          mentionDateRangePresetSelectValue={mentionDateRangePresetSelectValue}
          dateRangeOrderInvalid={dateRangeOrderInvalid}
          onMentionDateRangePresetSelectChange={
            handleMentionDateRangePresetSelectChange
          }
          onDateFromInputChange={handleDateFromInputChange}
          onDateToInputChange={handleDateToInputChange}
          onModelChange={(value) => updateFilter("model", value)}
          onSentimentChange={(value) => updateFilter("sentiment", value)}
          onMentionedChange={(value) => updateFilter("mentioned", value)}
        />

        <div className="min-w-0 space-y-2 ">
          <div
            aria-hidden="true"
            className="text-xs font-medium text-muted-foreground opacity-0"
          >
            Reset
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!filterSummary.hasActiveFilters}
            className="min-h-11 w-full sm:min-h-8"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {dateRangeOrderInvalid ? (
        <p
          className="mt-2 hidden text-sm text-destructive sm:block"
          role="alert"
        >
          {MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE}
        </p>
      ) : null}
    </div>
  );
}
