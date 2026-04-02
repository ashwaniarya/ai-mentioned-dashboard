"use client";

import { useCallback, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type DateRangePresetPopoverCommittedValue = {
  preset: string;
  dateFrom?: string;
  dateTo?: string;
};

export interface DateRangePresetPopoverProps {
  customPresetValue: string;
  presets: ReadonlyArray<{ value: string; label: string }>;
  value: DateRangePresetPopoverCommittedValue;
  onApply: (next: DateRangePresetPopoverCommittedValue) => void;
  triggerClassName?: string;
  leadingIcon?: ReactNode;
  triggerAriaLabel?: string;
  /** Shown on the trigger when `value.preset === customPresetValue` and both dates exist. */
  customRangeDisplaySeparator?: string;
  invalidDateOrderMessage: string;
  popoverScreenReaderTitle?: string;
  presetsGroupAriaLabel?: string;
  contentTestId?: string;
  triggerTestId?: string;
  combinedFieldShellClassName: string;
  combinedFieldFlexRowClassName: string;
  dateInputClassName: string;
  dateLabelCellClassName: string;
}

function committedTriggerLabel(
  value: DateRangePresetPopoverCommittedValue,
  presets: DateRangePresetPopoverProps["presets"],
  customPresetValue: string,
  customRangeDisplaySeparator: string
): string {
  if (
    value.preset === customPresetValue &&
    value.dateFrom &&
    value.dateTo
  ) {
    return `${value.dateFrom}${customRangeDisplaySeparator}${value.dateTo}`;
  }
  if (value.preset === customPresetValue) {
    const customChoice = presets.find((p) => p.value === customPresetValue);
    return customChoice?.label ?? "Custom";
  }
  const choice = presets.find((p) => p.value === value.preset);
  return choice?.label ?? value.preset;
}

export function DateRangePresetPopover({
  customPresetValue,
  presets,
  value,
  onApply,
  triggerClassName,
  leadingIcon,
  triggerAriaLabel = "Date range",
  customRangeDisplaySeparator = " – ",
  invalidDateOrderMessage,
  popoverScreenReaderTitle = "Date range",
  presetsGroupAriaLabel = "Date range presets",
  contentTestId,
  triggerTestId,
  combinedFieldShellClassName,
  combinedFieldFlexRowClassName,
  dateInputClassName,
  dateLabelCellClassName,
}: DateRangePresetPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draftPreset, setDraftPreset] = useState(value.preset);
  const [draftFrom, setDraftFrom] = useState(value.dateFrom ?? "");
  const [draftTo, setDraftTo] = useState(value.dateTo ?? "");

  const snapshotDraftFromCommitted = useCallback(() => {
    setDraftPreset(value.preset);
    setDraftFrom(value.dateFrom ?? "");
    setDraftTo(value.dateTo ?? "");
  }, [value]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        snapshotDraftFromCommitted();
      }
      setOpen(nextOpen);
    },
    [snapshotDraftFromCommitted]
  );

  const customDraftActive = draftPreset === customPresetValue;
  const orderInvalid =
    customDraftActive &&
    Boolean(draftFrom) &&
    Boolean(draftTo) &&
    draftFrom > draftTo;
  const canApplyCustom =
    customDraftActive &&
    Boolean(draftFrom) &&
    Boolean(draftTo) &&
    draftFrom <= draftTo;
  const applyButtonDisabled = customDraftActive ? !canApplyCustom : false;

  const handleApplyClick = useCallback(() => {
    if (applyButtonDisabled) return;
    onApply({
      preset: draftPreset,
      dateFrom: customDraftActive ? draftFrom : undefined,
      dateTo: customDraftActive ? draftTo : undefined,
    });
    setOpen(false);
  }, [
    applyButtonDisabled,
    customDraftActive,
    draftFrom,
    draftPreset,
    draftTo,
    onApply,
  ]);

  const triggerText = committedTriggerLabel(
    value,
    presets,
    customPresetValue,
    customRangeDisplaySeparator
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        type="button"
        data-testid={triggerTestId}
        aria-label={triggerAriaLabel}
        className={cn(
          "flex w-full min-w-0 items-center gap-1.5 py-1 pr-2 pl-2 text-left text-sm transition-all duration-200",
          triggerClassName
        )}
      >
        {leadingIcon != null ? (
          <span className="flex shrink-0 items-center justify-center text-muted-foreground">
            {leadingIcon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{triggerText}</span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground",
            leadingIcon != null && "ml-auto"
          )}
          aria-hidden
        />
      </PopoverTrigger>
      <PopoverContent
        data-testid={contentTestId}
        align="start"
        className="flex w-[min(100vw-2rem,20rem)] flex-col gap-2 sm:w-80"
      >
        <PopoverHeader className="sr-only">
          <PopoverTitle>{popoverScreenReaderTitle}</PopoverTitle>
        </PopoverHeader>

        <div
          role="radiogroup"
          aria-label={presetsGroupAriaLabel}
          className="flex flex-col gap-0.5"
        >
          {presets.map((opt) => {
            const selected = draftPreset === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={cn(
                  "rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors",
                  "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
                  selected && "bg-muted font-medium"
                )}
                onClick={() => setDraftPreset(opt.value)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {customDraftActive ? (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  combinedFieldFlexRowClassName,
                  combinedFieldShellClassName
                )}
              >
                <span
                  className={dateLabelCellClassName}
                  aria-hidden
                  title="From date"
                >
                  From
                </span>
                <Input
                  type="date"
                  aria-label="From date"
                  className={cn(
                    "min-w-0 flex-1 transition-all duration-200",
                    dateInputClassName
                  )}
                  value={draftFrom}
                  onChange={(e) => setDraftFrom(e.target.value)}
                />
              </div>
              <div
                className={cn(
                  combinedFieldFlexRowClassName,
                  combinedFieldShellClassName
                )}
              >
                <span
                  className={dateLabelCellClassName}
                  aria-hidden
                  title="To date"
                >
                  To
                </span>
                <Input
                  type="date"
                  aria-label="To date"
                  className={cn(
                    "min-w-0 flex-1 transition-all duration-200",
                    dateInputClassName
                  )}
                  value={draftTo}
                  onChange={(e) => setDraftTo(e.target.value)}
                />
              </div>
            </div>
          </>
        ) : null}

        {orderInvalid ? (
          <p className="text-destructive text-xs" role="alert">
            {invalidDateOrderMessage}
          </p>
        ) : null}

        <Separator />

        <div className="flex flex-row flex-nowrap items-center justify-end gap-2">
          <PopoverClose
            type="button"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Close
          </PopoverClose>
          <Button
            type="button"
            size="sm"
            disabled={applyButtonDisabled}
            onClick={handleApplyClick}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
