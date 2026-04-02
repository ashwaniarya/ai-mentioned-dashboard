"use client";

import type { ReactNode } from "react";

import { Layers } from "lucide-react";

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
import { MentionModelIcon } from "@/components/mention-table/mention-model-icon";
import { labelForValue } from "@/lib/helpers/mention-filter-label-helpers";
import {
  mentionModelBrandFromApiValue,
  mentionModelIconTintClassByBrand,
} from "@/lib/mention-model-brand";
import { cn } from "@/lib/utils";
import type { MentionFilters } from "@/models";

export const mentionFilterFieldLabelClassName = cn(
  "block font-medium text-[length:var(--dashboard-type-caption-size)] leading-[var(--dashboard-type-caption-line-height)] text-muted-foreground"
);

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

function MentionFilterModelLeadingGlyph({
  optionValue,
}: {
  optionValue: string;
}) {
  if (optionValue === FACET.ALL) {
    return <Layers className="size-4 text-muted-foreground" aria-hidden />;
  }
  const brand = mentionModelBrandFromApiValue(optionValue);
  return (
    <MentionModelIcon
      brand={brand}
      className={cn("size-4", mentionModelIconTintClassByBrand[brand])}
    />
  );
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
      <label className={mentionFilterFieldLabelClassName}>{label}</label>
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
  /** iOS WebKit shrinks type="date" unless height + appearance are explicit (select row stays tall). */
  const mentionFilterDateInputClassName =
    "h-11 min-h-11 py-2 leading-normal appearance-none sm:h-8 sm:min-h-8 sm:py-1";

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
          className={mentionFilterDateInputClassName}
        />
      </MentionFilterField>

      <MentionFilterField label="To">
        <Input
          type="date"
          aria-invalid={dateRangeOrderInvalid}
          value={filters.date_to ?? ""}
          onChange={(event) => onDateToInputChange(event.target.value)}
          className={mentionFilterDateInputClassName}
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
            <SelectValue>
              {(value) => {
                const key =
                  value === null || value === undefined
                    ? FACET.ALL
                    : String(value);
                return (
                  <>
                    <MentionFilterModelLeadingGlyph optionValue={key} />
                    {labelForValue(mentionFilterChoices.model, value)}
                  </>
                );
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {mentionFilterChoices.model.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <MentionFilterModelLeadingGlyph optionValue={option.value} />
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
