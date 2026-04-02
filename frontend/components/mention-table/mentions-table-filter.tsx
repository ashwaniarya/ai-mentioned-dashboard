"use client";

import { cn } from "@/lib/utils";
import type { MentionFilters } from "@/models";
import {
  DATE_PRESET,
  MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE,
  MENTIONED_VALUE,
  mentionFilterChoices,
  FACET,
} from "@/config";
import type { MentionDateRangePreset } from "@/config";
import { labelForValue } from "@/lib/helpers/choice-display-label";
import { mentionFiltersShallowEqualForDashboard } from "@/lib/helpers/mention-filters";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DashboardBodyText } from "@/components/ui/typography";
import { MentionFiltersResetIconButton } from "@/components/mention-filters/mention-filters-reset-icon-button";
import {
  dashboardMentionFilterFieldLabelClasses,
  dashboardMentionFilterFlexibleFieldClasses,
  dashboardMentionFilterHorizontalControlRowClasses,
  dashboardMentionFilterInputContainerClasses,
  useDashboardMentionFilterSharedHandlers,
} from "@/components/mention-filters/use-dashboard-mention-filter-shared-handlers";

export interface MentionsTableFilterProps {
  filters: MentionFilters;
  onFiltersChange: (filters: MentionFilters) => void;
}

export function MentionsTableFilter({ filters, onFiltersChange }: MentionsTableFilterProps) {
  const {
    normalizedDashboardBaselineMentionFilters,
    dateRangeOrderInvalid,
    mentionDateRangePresetSelectValue,
    handleDatePresetChange,
    handleDateFromChange,
    handleDateToChange,
    handleModelChange,
    handleSentimentChange,
    handleResetDashboardMentionFilters,
  } = useDashboardMentionFilterSharedHandlers({ filters, onFiltersChange });

  const handleMentionedChange = (value: string | null) => {
    if (value === null) return;
    onFiltersChange({ ...filters, mentioned: value === FACET.ALL ? undefined : value === MENTIONED_VALUE.YES });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-nowrap sm:items-end p-1">
      <div className={dashboardMentionFilterHorizontalControlRowClasses}>
        <div className="flex min-w-0 shrink-0 flex-col">
          <div
            aria-hidden="true"
            className={cn(
              dashboardMentionFilterFieldLabelClasses,
              "opacity-0 select-none pointer-events-none"
            )}
          >
            Reset
          </div>
          <MentionFiltersResetIconButton
            ariaLabel="Reset table filters"
            disabled={mentionFiltersShallowEqualForDashboard(
              filters,
              normalizedDashboardBaselineMentionFilters
            )}
            onClick={handleResetDashboardMentionFilters}
          />
        </div>

        <div className={dashboardMentionFilterFlexibleFieldClasses}>
          <label className={dashboardMentionFilterFieldLabelClasses}>Date Range</label>
          <Select
            value={mentionDateRangePresetSelectValue}
            onValueChange={(val) => { if (val) handleDatePresetChange(val as MentionDateRangePreset); }}
            itemToStringLabel={(value) => labelForValue(mentionFilterChoices.dateRange, value)}
          >
            <SelectTrigger className={cn("w-full transition-all duration-200", dashboardMentionFilterInputContainerClasses)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mentionFilterChoices.dateRange.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {mentionDateRangePresetSelectValue === DATE_PRESET.CUSTOM && (
        <div className={dashboardMentionFilterHorizontalControlRowClasses}>
          <div className={dashboardMentionFilterFlexibleFieldClasses}>
            <label className={dashboardMentionFilterFieldLabelClasses}>From</label>
            <Input type="date" className={cn("transition-all duration-200", dashboardMentionFilterInputContainerClasses)} value={filters.date_from ?? ""} onChange={(e) => handleDateFromChange(e.target.value)} />
          </div>
          <div className={dashboardMentionFilterFlexibleFieldClasses}>
            <label className={dashboardMentionFilterFieldLabelClasses}>To</label>
            <Input type="date" className={cn("transition-all duration-200", dashboardMentionFilterInputContainerClasses)} value={filters.date_to ?? ""} onChange={(e) => handleDateToChange(e.target.value)} />
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex w-full flex-col gap-4",
          "min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-end min-[480px]:gap-3",
          "sm:contents"
        )}
      >
        <div className="w-full min-w-0 flex-1 sm:min-w-[140px]">
          <label className={dashboardMentionFilterFieldLabelClasses}>Model Version</label>
          <Select
            value={filters.model ?? FACET.ALL}
            onValueChange={handleModelChange}
            itemToStringLabel={(value) => labelForValue(mentionFilterChoices.model, value)}
          >
            <SelectTrigger
              className={cn(
                "w-full min-w-0 transition-all duration-200",
                dashboardMentionFilterInputContainerClasses
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mentionFilterChoices.model.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full min-w-0 flex-1 sm:min-w-[140px]">
          <label className={dashboardMentionFilterFieldLabelClasses}>Result Sentiment</label>
          <Select
            value={filters.sentiment ?? FACET.ALL}
            onValueChange={handleSentimentChange}
            itemToStringLabel={(value) => labelForValue(mentionFilterChoices.sentiment, value)}
          >
            <SelectTrigger
              className={cn(
                "w-full min-w-0 transition-all duration-200",
                dashboardMentionFilterInputContainerClasses
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mentionFilterChoices.sentiment.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full min-w-0 flex-1 sm:min-w-[140px]">
          <label className={dashboardMentionFilterFieldLabelClasses}>Was Mentioned?</label>
          <Select
            value={filters.mentioned === true ? MENTIONED_VALUE.YES : filters.mentioned === false ? MENTIONED_VALUE.NO : FACET.ALL}
            onValueChange={handleMentionedChange}
            itemToStringLabel={(value) => labelForValue(mentionFilterChoices.mentioned, value)}
          >
            <SelectTrigger
              className={cn(
                "w-full min-w-0 transition-all duration-200",
                dashboardMentionFilterInputContainerClasses
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mentionFilterChoices.mentioned.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
