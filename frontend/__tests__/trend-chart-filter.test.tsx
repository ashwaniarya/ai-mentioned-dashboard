import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { TrendChartFilter } from "@/components/trend-chart/trend-chart-filter";
import { normalizeDashboardMentionFiltersAfterParse } from "@/lib/helpers/mention-filter-default-date-range";
import { DATE_PRESET } from "@/config";
import type { MentionFilters } from "@/models";

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

  it("selecting Custom in Date Range then dashboard normalize still shows From/To", async () => {
    function TrendChartFilterUnderDashboardNormalize() {
      const [filters, setFilters] = useState<MentionFilters>({
        mention_date_range_preset: DATE_PRESET.MAXIMUM,
      });
      return (
        <TrendChartFilter
          filters={filters}
          onFiltersChange={(next) =>
            setFilters(normalizeDashboardMentionFiltersAfterParse(next, new Date()))
          }
        />
      );
    }

    render(<TrendChartFilterUnderDashboardNormalize />);

    const dateRangeTrigger = document.querySelectorAll(
      '[data-slot="select-trigger"]'
    )[0] as HTMLElement;
    fireEvent.click(dateRangeTrigger);

    const listbox = await screen.findByRole("listbox");
    const customOption = within(listbox).getByRole("option", { name: /^custom$/i });
    fireEvent.click(customOption);

    await waitFor(() => {
      expect(screen.getByText("From")).toBeInTheDocument();
      expect(screen.getByText("To")).toBeInTheDocument();
    });
  });
});
