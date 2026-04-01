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
import { isMentionDateRangeOrderInvalid } from "@/lib/validation";
import { MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE } from "@/config";

export interface MentionFilterControlProps {
  filters: MentionFilters;
  onFiltersChange: (filters: MentionFilters) => void;
}

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
}: MentionFilterControlProps) {
  const updateFilter = <K extends keyof MentionFilters>(
    key: K,
    value: MentionFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== ""
  );

  const dateRangeOrderInvalid = isMentionDateRangeOrderInvalid(filters);

  return (
    <div className="w-full min-w-0">
      <div className="grid grid-cols-3 gap-3 xl:grid-cols-6">
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

        <div className="min-w-0 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <Input
            type="date"
            aria-invalid={dateRangeOrderInvalid}
            value={filters.date_from ?? ""}
            onChange={(e) =>
              updateFilter("date_from", e.target.value || undefined)
            }
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
            onChange={(e) =>
              updateFilter("date_to", e.target.value || undefined)
            }
          />
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
