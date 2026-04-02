"use client";

import { cn } from "@/lib/utils";
import type { MentionFilters } from "@/models";
import {
  DATE_PRESET,
  DASHBOARD_DATE_RANGE_TRIGGER_CUSTOM_RANGE_DISPLAY_SEPARATOR,
  MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE,
  mentionFilterChoices,
  FACET,
} from "@/config";
import { labelForValue } from "@/lib/helpers/choice-display-label";
import {
  mentionFiltersShallowEqualForDashboard,
  mentionFiltersToDateRangePresetPopoverValue,
} from "@/lib/helpers/mention-filters";
import { Bot, CalendarRange, Smile } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardBodyText } from "@/components/ui/typography";
import { DateRangePresetPopover } from "@/components/date-range/date-range-preset-popover";
import { MentionFiltersResetIconButton } from "@/components/mention-filters/mention-filters-reset-icon-button";
import {
  dashboardMentionDateRangePopoverContentTestId,
  dashboardMentionDateRangePopoverTriggerTestId,
  dashboardMentionFilterCombinedFieldFlexRowClasses,
  dashboardMentionFilterCombinedFieldShellClasses,
  dashboardMentionFilterFlexibleFieldClasses,
  dashboardMentionFilterHorizontalControlRowClasses,
  dashboardMentionFilterInputContainerClasses,
  dashboardMentionFilterSelectTriggerClasses,
  dashboardMentionFilterVisibleDateRangeLabelCellClasses,
  dashboardChartGroupBySegmentSelectedButtonClasses,
  useDashboardMentionFilterSharedHandlers,
} from "@/components/mention-filters/use-dashboard-mention-filter-shared-handlers";

export interface TrendChartFilterProps {
  filters: MentionFilters;
  onFiltersChange: (filters: MentionFilters) => void;
}

export function TrendChartFilter({ filters, onFiltersChange }: TrendChartFilterProps) {
  const {
    normalizedDashboardBaselineMentionFilters,
    dateRangeOrderInvalid,
    handleMentionDateRangePopoverApply,
    handleModelChange,
    handleSentimentChange,
    handleResetDashboardMentionFilters,
  } = useDashboardMentionFilterSharedHandlers({ filters, onFiltersChange });

  const handleTrendChartGroupByOptionSelect = (nextValue: "day" | "week") => {
    onFiltersChange({
      ...filters,
      group_by: nextValue === "day" ? undefined : "week",
    });
  };

  const trendChartGroupBySelectedValue = filters.group_by ?? "day";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-nowrap sm:items-center p-1">
      <div className={dashboardMentionFilterHorizontalControlRowClasses}>
        <MentionFiltersResetIconButton
          ariaLabel="Reset chart filters"
          disabled={mentionFiltersShallowEqualForDashboard(
            filters,
            normalizedDashboardBaselineMentionFilters
          )}
          onClick={handleResetDashboardMentionFilters}
        />

        <div className={dashboardMentionFilterFlexibleFieldClasses}>
          <DateRangePresetPopover
            customPresetValue={DATE_PRESET.CUSTOM}
            presets={mentionFilterChoices.dateRange}
            value={mentionFiltersToDateRangePresetPopoverValue(filters)}
            onApply={handleMentionDateRangePopoverApply}
            triggerClassName={cn(
              "transition-all duration-200",
              dashboardMentionFilterSelectTriggerClasses
            )}
            leadingIcon={<CalendarRange className="size-4" aria-hidden />}
            invalidDateOrderMessage={MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE}
            customRangeDisplaySeparator={
              DASHBOARD_DATE_RANGE_TRIGGER_CUSTOM_RANGE_DISPLAY_SEPARATOR
            }
            contentTestId={dashboardMentionDateRangePopoverContentTestId}
            triggerTestId={dashboardMentionDateRangePopoverTriggerTestId}
            combinedFieldShellClassName={
              dashboardMentionFilterCombinedFieldShellClasses
            }
            combinedFieldFlexRowClassName={
              dashboardMentionFilterCombinedFieldFlexRowClasses
            }
            dateInputClassName={dashboardMentionFilterInputContainerClasses}
            dateLabelCellClassName={
              dashboardMentionFilterVisibleDateRangeLabelCellClasses
            }
          />
        </div>
      </div>

      <div
        className={cn(
          "flex w-full flex-col gap-4",
          "min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center min-[480px]:gap-3",
          "sm:contents"
        )}
      >
        <div className="w-full min-w-0 flex-1 sm:min-w-[140px]">
          <Select
            value={filters.model ?? FACET.ALL}
            onValueChange={handleModelChange}
            itemToStringLabel={(value) => labelForValue(mentionFilterChoices.model, value)}
          >
            <SelectTrigger
              aria-label="Model version"
              leadingIcon={<Bot className="size-4" aria-hidden />}
              className={cn(
                "min-w-0 transition-all duration-200",
                dashboardMentionFilterSelectTriggerClasses
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mentionFilterChoices.model.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full min-w-0 flex-1 sm:min-w-[140px]">
          <Select
            value={filters.sentiment ?? FACET.ALL}
            onValueChange={handleSentimentChange}
            itemToStringLabel={(value) => labelForValue(mentionFilterChoices.sentiment, value)}
          >
            <SelectTrigger
              aria-label="Result sentiment"
              leadingIcon={<Smile className="size-4" aria-hidden />}
              className={cn(
                "min-w-0 transition-all duration-200",
                dashboardMentionFilterSelectTriggerClasses
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mentionFilterChoices.sentiment.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full min-w-0 flex-1 sm:min-w-[140px]">
          <div className={dashboardMentionFilterCombinedFieldShellClasses}>
            <div
              role="radiogroup"
              aria-label="Group by"
              className={cn(
                "flex h-9 min-h-9 w-full min-w-0 items-stretch border-0 bg-transparent p-0.5 outline-none",
                "gap-0.5"
              )}
            >
              {mentionFilterChoices.groupBy.map((opt) => {
                const isSelected = trendChartGroupBySelectedValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={cn(
                      "min-w-0 flex-1 rounded-md text-xs font-medium transition-colors outline-none select-none",
                      "text-muted-foreground focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0",
                      isSelected && dashboardChartGroupBySegmentSelectedButtonClasses
                    )}
                    onClick={() =>
                      handleTrendChartGroupByOptionSelect(opt.value as "day" | "week")
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {dateRangeOrderInvalid && (
        <DashboardBodyText className="text-destructive mt-3 w-full text-[13px]" role="alert">
          {MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE}
        </DashboardBodyText>
      )}
    </div>
  );
}
