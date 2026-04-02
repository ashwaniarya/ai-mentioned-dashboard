"use client";

import { cn } from "@/lib/utils";
import type { MentionFilters } from "@/models";
import { isMentionDateRangeOrderInvalid } from "@/lib/helpers/mention-filter-api";
import { getMentionDateRangeForMentionDateRangeRollingPreset } from "@/lib/helpers/mention-filter-default-date-range";
import {
  DATE_PRESET,
  MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE,
  MENTION_ROLLING_PRESET_DAY_COUNTS,
  MENTIONED_VALUE,
  mentionFilterChoices,
  FACET,
} from "@/config";
import type { MentionDateRangePreset, MentionRollingDateRangePreset } from "@/config";
import { labelForValue } from "@/lib/helpers/mention-filter-label-helpers";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DashboardBodyText } from "@/components/ui/typography";

export interface MentionsTableFilterProps {
  filters: MentionFilters;
  onFiltersChange: (filters: MentionFilters) => void;
}

export function MentionsTableFilter({ filters, onFiltersChange }: MentionsTableFilterProps) {
  const dateRangeOrderInvalid = isMentionDateRangeOrderInvalid(filters);
  const mentionDateRangePresetSelectValue =
    (filters.mention_date_range_preset ?? DATE_PRESET.MAXIMUM) as MentionDateRangePreset;

  const handleDatePresetChange = (preset: MentionDateRangePreset) => {
    const anchorDate = new Date();
    if (preset === DATE_PRESET.MAXIMUM) {
      onFiltersChange({ ...filters, date_from: undefined, date_to: undefined, mention_date_range_preset: DATE_PRESET.MAXIMUM });
      return;
    }
    if (preset === DATE_PRESET.CUSTOM) {
      onFiltersChange({ ...filters, mention_date_range_preset: DATE_PRESET.CUSTOM });
      return;
    }
    if (preset in MENTION_ROLLING_PRESET_DAY_COUNTS) {
      const range = getMentionDateRangeForMentionDateRangeRollingPreset(anchorDate, preset as MentionRollingDateRangePreset);
      onFiltersChange({ ...filters, ...range, mention_date_range_preset: preset });
    }
  };

  const handleDateFromChange = (rawValue: string) => {
    const dateFrom = rawValue || undefined;
    const bothMissing = !dateFrom && !filters.date_to;
    onFiltersChange({
      ...filters,
      date_from: dateFrom,
      mention_date_range_preset: bothMissing ? DATE_PRESET.MAXIMUM : DATE_PRESET.CUSTOM,
    });
  };

  const handleDateToChange = (rawValue: string) => {
    const dateTo = rawValue || undefined;
    const bothMissing = !filters.date_from && !dateTo;
    onFiltersChange({
      ...filters,
      date_to: dateTo,
      mention_date_range_preset: bothMissing ? DATE_PRESET.MAXIMUM : DATE_PRESET.CUSTOM,
    });
  };

  const handleModelChange = (value: string | null) => {
    if (value === null) return;
    onFiltersChange({ ...filters, model: value === FACET.ALL ? undefined : (value as MentionFilters["model"]) });
  };

  const handleSentimentChange = (value: string | null) => {
    if (value === null) return;
    onFiltersChange({ ...filters, sentiment: value === FACET.ALL ? undefined : (value as MentionFilters["sentiment"]) });
  };

  const handleMentionedChange = (value: string | null) => {
    if (value === null) return;
    onFiltersChange({ ...filters, mentioned: value === FACET.ALL ? undefined : value === MENTIONED_VALUE.YES });
  };

  const fieldLabelClasses = "block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5";
  const inputContainerClasses = "h-9 py-1 px-3 bg-muted/20 hover:bg-muted/40 transition-colors border-border/50";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap p-1">
      <div className="flex-1 min-w-[140px]">
        <label className={fieldLabelClasses}>Date Range</label>
        <Select
          value={mentionDateRangePresetSelectValue}
          onValueChange={(val) => { if (val) handleDatePresetChange(val as MentionDateRangePreset); }}
          itemToStringLabel={(value) => labelForValue(mentionFilterChoices.dateRange, value)}
        >
          <SelectTrigger className={cn("w-full transition-all duration-200", inputContainerClasses)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mentionFilterChoices.dateRange.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {mentionDateRangePresetSelectValue === DATE_PRESET.CUSTOM && (
        <>
          <div className="flex-1 min-w-[140px]">
            <label className={fieldLabelClasses}>From</label>
            <Input type="date" className={cn("transition-all duration-200", inputContainerClasses)} value={filters.date_from ?? ""} onChange={(e) => handleDateFromChange(e.target.value)} />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className={fieldLabelClasses}>To</label>
            <Input type="date" className={cn("transition-all duration-200", inputContainerClasses)} value={filters.date_to ?? ""} onChange={(e) => handleDateToChange(e.target.value)} />
          </div>
        </>
      )}

      <div className="flex-1 min-w-[140px]">
        <label className={fieldLabelClasses}>Model Version</label>
        <Select
          value={filters.model ?? FACET.ALL}
          onValueChange={handleModelChange}
          itemToStringLabel={(value) => labelForValue(mentionFilterChoices.model, value)}
        >
          <SelectTrigger className={cn("w-full transition-all duration-200", inputContainerClasses)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mentionFilterChoices.model.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className={fieldLabelClasses}>Result Sentiment</label>
        <Select
          value={filters.sentiment ?? FACET.ALL}
          onValueChange={handleSentimentChange}
          itemToStringLabel={(value) => labelForValue(mentionFilterChoices.sentiment, value)}
        >
          <SelectTrigger className={cn("w-full transition-all duration-200", inputContainerClasses)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mentionFilterChoices.sentiment.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className={fieldLabelClasses}>Was Mentioned?</label>
        <Select
          value={filters.mentioned === true ? MENTIONED_VALUE.YES : filters.mentioned === false ? MENTIONED_VALUE.NO : FACET.ALL}
          onValueChange={handleMentionedChange}
          itemToStringLabel={(value) => labelForValue(mentionFilterChoices.mentioned, value)}
        >
          <SelectTrigger className={cn("w-full transition-all duration-200", inputContainerClasses)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mentionFilterChoices.mentioned.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {dateRangeOrderInvalid && (
        <DashboardBodyText className="text-destructive mt-3 w-full text-[13px]" role="alert">
          {MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE}
        </DashboardBodyText>
      )}
    </div>
  );
}
