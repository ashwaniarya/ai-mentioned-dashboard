import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { TrendChartFilter } from "@/components/trend-chart/trend-chart-filter";
import {
  getDashboardBaselineMentionFilters,
  normalizeDashboardMentionFiltersAfterParse,
} from "@/lib/helpers/mention-filters";
import { DATE_PRESET } from "@/config";
import {
  dashboardMentionDateRangePopoverContentTestId,
  dashboardMentionDateRangePopoverTriggerTestId,
  dashboardMentionFilterHorizontalControlRowClasses,
} from "@/components/mention-filters/use-dashboard-mention-filter-shared-handlers";

function expectElementUsesDashboardMentionFilterHorizontalControlRow(element: Element) {
  for (const token of dashboardMentionFilterHorizontalControlRowClasses.split(/\s+/).filter(Boolean)) {
    expect(element.className).toContain(token);
  }
}

describe("TrendChartFilter", () => {
  it("shows From date and To date inside the date popover when Custom is chosen and filters pass through dashboard normalize", () => {
    const filters = normalizeDashboardMentionFiltersAfterParse(
      { mention_date_range_preset: DATE_PRESET.CUSTOM },
      new Date()
    );
    render(<TrendChartFilter filters={filters} onFiltersChange={vi.fn()} />);

    fireEvent.click(screen.getByTestId(dashboardMentionDateRangePopoverTriggerTestId));

    const surface = screen.getByTestId(dashboardMentionDateRangePopoverContentTestId);
    expect(within(surface).getByLabelText(/^from date$/i)).toBeInTheDocument();
    expect(within(surface).getByLabelText(/^to date$/i)).toBeInTheDocument();
  });

  it("keeps reset and Date range trigger in one horizontal row; From/To only inside popover when Custom", () => {
    const filters = normalizeDashboardMentionFiltersAfterParse(
      { mention_date_range_preset: DATE_PRESET.CUSTOM },
      new Date()
    );
    const { container } = render(<TrendChartFilter filters={filters} onFiltersChange={vi.fn()} />);

    const resetButton = screen.getByRole("button", { name: /reset chart filters/i });
    const resetAndDateRow = resetButton.parentElement!;
    expectElementUsesDashboardMentionFilterHorizontalControlRow(resetAndDateRow);
    expect(
      within(resetAndDateRow).getByRole("button", { name: /date range/i })
    ).toBeInTheDocument();

    expect(container.querySelectorAll('input[type="date"]')).toHaveLength(0);

    fireEvent.click(screen.getByTestId(dashboardMentionDateRangePopoverTriggerTestId));
    const surface = screen.getByTestId(dashboardMentionDateRangePopoverContentTestId);
    expect(within(surface).getAllByDisplayValue("")).toHaveLength(2);
  });

  it("reset calls onFiltersChange with normalized dashboard baseline", () => {
    const onFiltersChange = vi.fn();
    render(
      <TrendChartFilter
        filters={{
          model: "chatgpt",
          mention_date_range_preset: DATE_PRESET.MAXIMUM,
        }}
        onFiltersChange={onFiltersChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /reset chart filters/i }));

    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    expect(onFiltersChange).toHaveBeenCalledWith({
      mention_date_range_preset: DATE_PRESET.MAXIMUM,
    });
  });

  it("disables reset when filters already match dashboard baseline", () => {
    const onFiltersChange = vi.fn();
    render(
      <TrendChartFilter
        filters={normalizeDashboardMentionFiltersAfterParse(
          getDashboardBaselineMentionFilters(),
          new Date()
        )}
        onFiltersChange={onFiltersChange}
      />
    );

    expect(screen.getByRole("button", { name: /reset chart filters/i })).toBeDisabled();
  });
});
