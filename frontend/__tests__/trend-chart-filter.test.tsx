import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TrendChartFilter } from "@/components/trend-chart/trend-chart-filter";
import {
  getDashboardBaselineMentionFilters,
  normalizeDashboardMentionFiltersAfterParse,
} from "@/lib/helpers/mention-filters";
import { DATE_PRESET } from "@/config";
import { dashboardMentionFilterHorizontalControlRowClasses } from "@/components/mention-filters/use-dashboard-mention-filter-shared-handlers";

function expectElementUsesDashboardMentionFilterHorizontalControlRow(element: Element) {
  for (const token of dashboardMentionFilterHorizontalControlRowClasses.split(/\s+/).filter(Boolean)) {
    expect(element.className).toContain(token);
  }
}

describe("TrendChartFilter", () => {
  it("shows From and To when Custom is chosen and filters pass through dashboard normalize", () => {
    const filters = normalizeDashboardMentionFiltersAfterParse(
      { mention_date_range_preset: DATE_PRESET.CUSTOM },
      new Date()
    );
    render(
      <TrendChartFilter filters={filters} onFiltersChange={vi.fn()} />
    );
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
  });

  it("keeps reset and Date Range in one horizontal row and From/To in a second row when Custom", () => {
    const filters = normalizeDashboardMentionFiltersAfterParse(
      { mention_date_range_preset: DATE_PRESET.CUSTOM },
      new Date()
    );
    render(<TrendChartFilter filters={filters} onFiltersChange={vi.fn()} />);

    const resetButton = screen.getByRole("button", { name: /reset chart filters/i });
    const resetAndDateRow = resetButton.parentElement!.parentElement!;
    expectElementUsesDashboardMentionFilterHorizontalControlRow(resetAndDateRow);
    expect(resetAndDateRow.textContent).toContain("Date Range");

    const fromLabel = screen.getByText("From");
    const fromToRow = fromLabel.parentElement!.parentElement!;
    expectElementUsesDashboardMentionFilterHorizontalControlRow(fromToRow);
    expect(fromToRow.contains(screen.getByText("To"))).toBe(true);
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
