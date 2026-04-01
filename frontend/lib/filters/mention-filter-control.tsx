"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import type { MentionFilters } from "@/models";
import type { MentionDateRangePreset } from "@/config";
import { isMentionDateRangeOrderInvalid } from "@/lib/validation";
import {
  getMentionDateRangeForMentionDateRangeRollingPreset,
  mentionFiltersShallowEqualForDashboard,
} from "./mention-filter-default-date-range";
import {
  DATE_PRESET,
  FACET,
  MENTIONED_VALUE,
  MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE,
  MENTION_ROLLING_PRESET_DAY_COUNTS,
  labelForValue,
  mentionFilterChoices,
} from "@/config";
import type { MentionRollingDateRangePreset } from "@/config";

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
  const updateFilter = <K extends keyof MentionFilters>(
    key: K,
    value: MentionFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleMentionDateRangePresetSelectChange = (value: unknown) => {
    if (value === null || value === undefined) return;
    const preset = value as MentionDateRangePreset;
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
      mention_date_range_preset: bothDateBoundsMissing ? DATE_PRESET.MAXIMUM : DATE_PRESET.CUSTOM,
    });
  };

  const handleDateToInputChange = (rawValue: string) => {
    const dateTo = rawValue || undefined;
    const dateFrom = filters.date_from;
    const bothDateBoundsMissing = !dateFrom && !dateTo;
    onFiltersChange({
      ...filters,
      date_to: dateTo,
      mention_date_range_preset: bothDateBoundsMissing ? DATE_PRESET.MAXIMUM : DATE_PRESET.CUSTOM,
    });
  };

  const handleReset = () => {
    onFiltersChange({ ...dashboardBaselineMentionFilters });
  };

  const hasActiveFilters = !mentionFiltersShallowEqualForDashboard(
    filters,
    dashboardBaselineMentionFilters
  );

  const dateRangeOrderInvalid = isMentionDateRangeOrderInvalid(filters);

  const mentionDateRangePresetSelectValue =
    filters.mention_date_range_preset ?? DATE_PRESET.MAXIMUM;

  return (
    <div className="w-full min-w-0">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <div className="min-w-0 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Date range
          </label>
          <Select
            value={mentionDateRangePresetSelectValue}
            onValueChange={handleMentionDateRangePresetSelectChange}
            itemToStringLabel={(value) =>
              labelForValue(mentionFilterChoices.dateRange, value)
            }
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mentionFilterChoices.dateRange.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <Input
            type="date"
            aria-invalid={dateRangeOrderInvalid}
            value={filters.date_from ?? ""}
            onChange={(e) => handleDateFromInputChange(e.target.value)}
          />
        </div>

        <div className="min-w-0 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            To
          </label>
          <Input
            type="date"
            aria-invalid={dateRangeOrderInvalid}
            value={filters.date_to ?? ""}
            onChange={(e) => handleDateToInputChange(e.target.value)}
          />
        </div>

        <div className="min-w-0 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Model
          </label>
          <Select
            value={filters.model ?? FACET.ALL}
            onValueChange={(val) =>
              updateFilter(
                "model",
                val === FACET.ALL ? undefined : (val as MentionFilters["model"])
              )
            }
            itemToStringLabel={(value) =>
              labelForValue(mentionFilterChoices.model, value)
            }
          >
            <SelectTrigger className="w-full min-w-0">
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

        <div className="min-w-0 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Sentiment
          </label>
          <Select
            value={filters.sentiment ?? FACET.ALL}
            onValueChange={(val) =>
              updateFilter(
                "sentiment",
                val === FACET.ALL
                  ? undefined
                  : (val as MentionFilters["sentiment"])
              )
            }
            itemToStringLabel={(value) =>
              labelForValue(mentionFilterChoices.sentiment, value)
            }
          >
            <SelectTrigger className="w-full min-w-0">
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

        <div className="min-w-0 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Mentioned
          </label>
          <Select
            value={
              filters.mentioned === true
                ? MENTIONED_VALUE.YES
                : filters.mentioned === false
                  ? MENTIONED_VALUE.NO
                  : FACET.ALL
            }
            onValueChange={(val) =>
              updateFilter(
                "mentioned",
                val === FACET.ALL ? undefined : val === MENTIONED_VALUE.YES
              )
            }
            itemToStringLabel={(value) =>
              labelForValue(mentionFilterChoices.mentioned, value)
            }
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mentionFilterChoices.mentioned.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 items-end">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="w-full"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </div>
      {dateRangeOrderInvalid ? (
        <p
          className="mt-2 text-sm text-destructive"
          role="alert"
        >
          {MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE}
        </p>
      ) : null}
    </div>
  );
}
