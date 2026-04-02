import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { DateRangePresetPopover } from "@/components/date-range/date-range-preset-popover";
import { MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE } from "@/config";

const testPresets = [
  { value: "last_7_days", label: "Last 7 days" },
  { value: "maximum", label: "Maximum" },
  { value: "custom", label: "Custom" },
] as const;

const shell = "rounded border";
const flexRow = "flex";
const inputCls = "h-9";
const labelCell = "min-w-8";

describe("DateRangePresetPopover", () => {
  it("calls onApply with rolling preset when Apply is clicked", () => {
    const onApply = vi.fn();
    render(
      <DateRangePresetPopover
        customPresetValue="custom"
        presets={testPresets}
        value={{ preset: "maximum" }}
        onApply={onApply}
        invalidDateOrderMessage={MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE}
        combinedFieldShellClassName={shell}
        combinedFieldFlexRowClassName={flexRow}
        dateInputClassName={inputCls}
        dateLabelCellClassName={labelCell}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /date range/i }));
    fireEvent.click(screen.getByRole("radio", { name: /last 7 days/i }));
    fireEvent.click(screen.getByRole("button", { name: /^apply$/i }));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith({
      preset: "last_7_days",
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  it("does not call onApply when Close is used without Apply", () => {
    const onApply = vi.fn();
    render(
      <DateRangePresetPopover
        customPresetValue="custom"
        presets={testPresets}
        value={{ preset: "last_7_days" }}
        onApply={onApply}
        invalidDateOrderMessage={MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE}
        combinedFieldShellClassName={shell}
        combinedFieldFlexRowClassName={flexRow}
        dateInputClassName={inputCls}
        dateLabelCellClassName={labelCell}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /date range/i }));
    fireEvent.click(screen.getByRole("radio", { name: /maximum/i }));
    fireEvent.click(screen.getByRole("button", { name: /^close$/i }));

    expect(onApply).not.toHaveBeenCalled();
  });

  it("expands custom fields and applies with dates", () => {
    const onApply = vi.fn();
    render(
      <DateRangePresetPopover
        customPresetValue="custom"
        presets={testPresets}
        value={{ preset: "maximum" }}
        onApply={onApply}
        invalidDateOrderMessage={MENTION_FILTER_INVALID_DATE_RANGE_MESSAGE}
        combinedFieldShellClassName={shell}
        combinedFieldFlexRowClassName={flexRow}
        dateInputClassName={inputCls}
        dateLabelCellClassName={labelCell}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /date range/i }));
    const dialogSurface = screen.getByRole("dialog");
    fireEvent.click(within(dialogSurface).getByRole("radio", { name: /^custom$/i }));

    const from = within(dialogSurface).getByLabelText(/^from date$/i);
    const to = within(dialogSurface).getByLabelText(/^to date$/i);
    fireEvent.change(from, { target: { value: "2026-01-01" } });
    fireEvent.change(to, { target: { value: "2026-01-10" } });
    fireEvent.click(within(dialogSurface).getByRole("button", { name: /^apply$/i }));

    expect(onApply).toHaveBeenCalledWith({
      preset: "custom",
      dateFrom: "2026-01-01",
      dateTo: "2026-01-10",
    });
  });
});
