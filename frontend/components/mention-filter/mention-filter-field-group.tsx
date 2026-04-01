"use client";

import type { ReactNode } from "react";

import {
  FACET,
  MENTIONED_VALUE,
  mentionFilterChoices,
} from "@/config";
import type { MentionDateRangePreset } from "@/config";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { labelForValue } from "@/lib/helpers/mention-filter-label-helpers";
import type { MentionFilters } from "@/models";

interface MentionFilterFieldGroupProps {
  filters: MentionFilters;
  mentionDateRangePresetSelectValue: MentionDateRangePreset;
  dateRangeOrderInvalid: boolean;
  onMentionDateRangePresetSelectChange: (
    value: MentionDateRangePreset
  ) => void;
  onDateFromInputChange: (rawValue: string) => void;
  onDateToInputChange: (rawValue: string) => void;
  onModelChange: (value: MentionFilters["model"] | undefined) => void;
  onSentimentChange: (
    value: MentionFilters["sentiment"] | undefined
  ) => void;
  onMentionedChange: (value: MentionFilters["mentioned"] | undefined) => void;
}

function MentionFilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export function MentionFilterFieldGroup({
  filters,
  mentionDateRangePresetSelectValue,
  dateRangeOrderInvalid,
  onMentionDateRangePresetSelectChange,
  onDateFromInputChange,
  onDateToInputChange,
  onModelChange,
  onSentimentChange,
  onMentionedChange,
}: MentionFilterFieldGroupProps) {
  const mobileTouchTargetClassName = "min-h-11 sm:min-h-8";

  return (
    <>
      <MentionFilterField label="Date range">
        <Select
          value={mentionDateRangePresetSelectValue}
          onValueChange={(value) =>
            onMentionDateRangePresetSelectChange(value as MentionDateRangePreset)
          }
          itemToStringLabel={(value) =>
            labelForValue(mentionFilterChoices.dateRange, value)
          }
        >
          <SelectTrigger
            className={`w-full min-w-0 ${mobileTouchTargetClassName}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mentionFilterChoices.dateRange.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </MentionFilterField>

      <MentionFilterField label="From">
        <Input
          type="date"
          aria-invalid={dateRangeOrderInvalid}
          value={filters.date_from ?? ""}
          onChange={(event) => onDateFromInputChange(event.target.value)}
          className={mobileTouchTargetClassName}
        />
      </MentionFilterField>

      <MentionFilterField label="To">
        <Input
          type="date"
          aria-invalid={dateRangeOrderInvalid}
          value={filters.date_to ?? ""}
          onChange={(event) => onDateToInputChange(event.target.value)}
          className={mobileTouchTargetClassName}
        />
      </MentionFilterField>

      <MentionFilterField label="Model">
        <Select
          value={filters.model ?? FACET.ALL}
          onValueChange={(value) =>
            onModelChange(
              value === FACET.ALL ? undefined : (value as MentionFilters["model"])
            )
          }
          itemToStringLabel={(value) =>
            labelForValue(mentionFilterChoices.model, value)
          }
        >
          <SelectTrigger
            className={`w-full min-w-0 ${mobileTouchTargetClassName}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mentionFilterChoices.model.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </MentionFilterField>

      <MentionFilterField label="Sentiment">
        <Select
          value={filters.sentiment ?? FACET.ALL}
          onValueChange={(value) =>
            onSentimentChange(
              value === FACET.ALL
                ? undefined
                : (value as MentionFilters["sentiment"])
            )
          }
          itemToStringLabel={(value) =>
            labelForValue(mentionFilterChoices.sentiment, value)
          }
        >
          <SelectTrigger
            className={`w-full min-w-0 ${mobileTouchTargetClassName}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mentionFilterChoices.sentiment.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </MentionFilterField>

      <MentionFilterField label="Mentioned">
        <Select
          value={
            filters.mentioned === true
              ? MENTIONED_VALUE.YES
              : filters.mentioned === false
                ? MENTIONED_VALUE.NO
                : FACET.ALL
          }
          onValueChange={(value) =>
            onMentionedChange(
              value === FACET.ALL ? undefined : value === MENTIONED_VALUE.YES
            )
          }
          itemToStringLabel={(value) =>
            labelForValue(mentionFilterChoices.mentioned, value)
          }
        >
          <SelectTrigger
            className={`w-full min-w-0 ${mobileTouchTargetClassName}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mentionFilterChoices.mentioned.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </MentionFilterField>
    </>
  );
}
