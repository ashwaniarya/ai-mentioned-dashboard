import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MentionsTableFilter } from "@/components/mention-table/mentions-table-filter";
import {
  getDashboardBaselineMentionFilters,
  normalizeDashboardMentionFiltersAfterParse,
} from "@/lib/helpers/mention-filter-default-date-range";
import { DATE_PRESET } from "@/config";

describe("MentionsTableFilter", () => {
  it("reset calls onFiltersChange with normalized dashboard baseline", () => {
    const onFiltersChange = vi.fn();
    render(
      <MentionsTableFilter
        filters={{
          sentiment: "positive",
          mention_date_range_preset: DATE_PRESET.MAXIMUM,
        }}
        onFiltersChange={onFiltersChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /reset table filters/i }));

    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    expect(onFiltersChange).toHaveBeenCalledWith({
      mention_date_range_preset: DATE_PRESET.MAXIMUM,
    });
  });

  it("disables reset when filters already match dashboard baseline", () => {
    const onFiltersChange = vi.fn();
    render(
      <MentionsTableFilter
        filters={normalizeDashboardMentionFiltersAfterParse(
          getDashboardBaselineMentionFilters(),
          new Date()
        )}
        onFiltersChange={onFiltersChange}
      />
    );

    expect(screen.getByRole("button", { name: /reset table filters/i })).toBeDisabled();
  });
});
