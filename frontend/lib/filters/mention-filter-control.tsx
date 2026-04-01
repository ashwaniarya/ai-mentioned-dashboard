"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
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
  MOBILE_FILTER_SUMMARY_LABEL_LIMIT,
  MENTION_ROLLING_PRESET_DAY_COUNTS,
  labelForValue,
  mentionFilterChoices,
} from "@/config";
import type { MentionRollingDateRangePreset } from "@/config";
import { cn } from "@/lib/utils";

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

  const isDateRangeActive =
    (filters.date_from ?? undefined) !==
      (dashboardBaselineMentionFilters.date_from ?? undefined) ||
    (filters.date_to ?? undefined) !==
      (dashboardBaselineMentionFilters.date_to ?? undefined) ||
    mentionDateRangePresetSelectValue !==
      (dashboardBaselineMentionFilters.mention_date_range_preset ??
        DATE_PRESET.MAXIMUM);

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];

    if (isDateRangeActive) {
      labels.push(
        labelForValue(
          mentionFilterChoices.dateRange,
          mentionDateRangePresetSelectValue
        )
      );
    }
    if (filters.model) {
      labels.push(labelForValue(mentionFilterChoices.model, filters.model));
    }
    if (filters.sentiment) {
      labels.push(
        labelForValue(mentionFilterChoices.sentiment, filters.sentiment)
      );
    }
    if (filters.mentioned !== undefined) {
      labels.push(
        labelForValue(
          mentionFilterChoices.mentioned,
          filters.mentioned ? MENTIONED_VALUE.YES : MENTIONED_VALUE.NO
        )
      );
    }

    return labels;
  }, [
    filters.mentioned,
    filters.model,
    filters.sentiment,
    isDateRangeActive,
    mentionDateRangePresetSelectValue,
  ]);

  const mobileSummaryText = useMemo(() => {
    if (activeFilterLabels.length === 0) return "All filters";

    const visibleLabels = activeFilterLabels.slice(
      0,
      MOBILE_FILTER_SUMMARY_LABEL_LIMIT
    );
    const hiddenLabelCount =
      activeFilterLabels.length - MOBILE_FILTER_SUMMARY_LABEL_LIMIT;

    return hiddenLabelCount > 0
      ? `${visibleLabels.join(" • ")} • +${hiddenLabelCount} more`
      : visibleLabels.join(" • ");
  }, [activeFilterLabels]);

  const mobileActiveFilterText = hasActiveFilters
    ? `${activeFilterLabels.length} active`
    : "Default view";

  const mobileFilterPanelId = "mobile-mention-filter-panel";

  const renderDateRangeField = () => (
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
  );

  const renderDateFromField = () => (
    <div className="min-w-0 space-y-1">
      <label className="text-xs font-medium text-muted-foreground">From</label>
      <Input
        type="date"
        aria-invalid={dateRangeOrderInvalid}
        value={filters.date_from ?? ""}
        onChange={(e) => handleDateFromInputChange(e.target.value)}
      />
    </div>
  );

  const renderDateToField = () => (
    <div className="min-w-0 space-y-1">
      <label className="text-xs font-medium text-muted-foreground">To</label>
      <Input
        type="date"
        aria-invalid={dateRangeOrderInvalid}
        value={filters.date_to ?? ""}
        onChange={(e) => handleDateToInputChange(e.target.value)}
      />
    </div>
  );

  const renderModelField = () => (
    <div className="min-w-0 space-y-1">
      <label className="text-xs font-medium text-muted-foreground">Model</label>
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
  );

  const renderSentimentField = () => (
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
  );

  const renderMentionedField = () => (
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
  );

  return (
    <div className="w-full min-w-0">
      <div className="sm:hidden">
        <Button
          type="button"
          variant="outline"
          aria-expanded={isMobileFilterExpanded}
          aria-controls={mobileFilterPanelId}
          onClick={() => setIsMobileFilterExpanded((previous) => !previous)}
          className="flex h-auto w-full items-start justify-between gap-3 rounded-xl border-border/70 px-3 py-3 text-left"
        >
          <span className="flex min-w-0 items-start gap-2.5">
            <SlidersHorizontal className="mt-0.5 size-4 text-muted-foreground" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                Filters
              </span>
              <span className="block text-xs text-muted-foreground">
                {mobileActiveFilterText}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {mobileSummaryText}
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
              {renderDateRangeField()}
              {renderDateFromField()}
              {renderDateToField()}
              {renderModelField()}
              {renderSentimentField()}
              {renderMentionedField()}
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
              disabled={!hasActiveFilters}
              className="w-full"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        ) : null}
      </div>

      <div className="hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {renderDateRangeField()}
        {renderDateFromField()}
        {renderDateToField()}
        {renderModelField()}
        {renderSentimentField()}
        {renderMentionedField()}

        <div className="min-w-0 space-y-1">
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
          className="mt-2 hidden text-sm text-destructive sm:block"
          role="alert"
        >
          {MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE}
        </p>
      ) : null}
    </div>
  );
}
