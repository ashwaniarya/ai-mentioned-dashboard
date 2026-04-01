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
import type { MentionDateRangePreset, MentionFilters } from "@/models";
import { isMentionDateRangeOrderInvalid } from "@/lib/validation";
import {
  getMentionDateRangeForMentionDateRangeRollingPreset,
  mentionFiltersShallowEqualForDashboard,
} from "@/lib/mention-filter-default-date-range";
import { MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE } from "@/config";

export interface MentionFilterControlProps {
  filters: MentionFilters;
  onFiltersChange: (filters: MentionFilters) => void;
  /** Default date range + cleared facet filters; used for Reset and disabled state. */
  dashboardBaselineMentionFilters: MentionFilters;
}

const MENTION_DATE_RANGE_PRESET_SELECT_OPTIONS: {
  value: MentionDateRangePreset;
  label: string;
}[] = [
  { value: "last_3_days", label: "Last 3 days" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "maximum", label: "Maximum" },
  { value: "custom", label: "Custom" },
];

const MODEL_OPTIONS = [
  { value: "all", label: "All Models" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "perplexity", label: "Perplexity" },
];

const SENTIMENT_OPTIONS = [
  { value: "all", label: "All Sentiments" },
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
];

const MENTIONED_OPTIONS = [
  { value: "all", label: "All Mentions" },
  { value: "true", label: "Mentioned" },
  { value: "false", label: "Not Mentioned" },
];

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

  const handleMentionDateRangePresetSelectChange = (
    value: MentionDateRangePreset | null
  ) => {
    if (value === null) return;
    const preset = value;
    const anchorDate = new Date();
    if (preset === "maximum") {
      onFiltersChange({
        ...filters,
        date_from: undefined,
        date_to: undefined,
        mention_date_range_preset: "maximum",
      });
      return;
    }
    if (preset === "custom") {
      onFiltersChange({
        ...filters,
        mention_date_range_preset: "custom",
      });
      return;
    }
    if (
      preset === "last_3_days" ||
      preset === "last_7_days" ||
      preset === "last_30_days"
    ) {
      const range = getMentionDateRangeForMentionDateRangeRollingPreset(
        anchorDate,
        preset
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
      mention_date_range_preset: bothDateBoundsMissing ? "maximum" : "custom",
    });
  };

  const handleDateToInputChange = (rawValue: string) => {
    const dateTo = rawValue || undefined;
    const dateFrom = filters.date_from;
    const bothDateBoundsMissing = !dateFrom && !dateTo;
    onFiltersChange({
      ...filters,
      date_to: dateTo,
      mention_date_range_preset: bothDateBoundsMissing ? "maximum" : "custom",
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
    filters.mention_date_range_preset ?? "maximum";

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
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MENTION_DATE_RANGE_PRESET_SELECT_OPTIONS.map((opt) => (
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
            value={filters.model ?? "all"}
            onValueChange={(val) =>
              updateFilter(
                "model",
                val === "all" ? undefined : (val as MentionFilters["model"])
              )
            }
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODEL_OPTIONS.map((opt) => (
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
            value={filters.sentiment ?? "all"}
            onValueChange={(val) =>
              updateFilter(
                "sentiment",
                val === "all"
                  ? undefined
                  : (val as MentionFilters["sentiment"])
              )
            }
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SENTIMENT_OPTIONS.map((opt) => (
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
                ? "true"
                : filters.mentioned === false
                  ? "false"
                  : "all"
            }
            onValueChange={(val) =>
              updateFilter(
                "mentioned",
                val === "all" ? undefined : val === "true"
              )
            }
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MENTIONED_OPTIONS.map((opt) => (
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
