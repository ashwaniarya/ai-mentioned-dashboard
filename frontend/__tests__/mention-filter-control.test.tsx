import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MentionFilterControl } from "@/components/mention-filter/mention-filter-control";
import { getDashboardBaselineMentionFilters } from "@/lib/helpers/mention-filter-default-date-range";
import type { MentionFilters } from "@/models";

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({
    children,
    ...props
  }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const dashboardBaselineMentionFilters = getDashboardBaselineMentionFilters();

function renderMentionFilterControl(filters: MentionFilters) {
  const onFiltersChange = vi.fn();

  const renderResult = render(
    <MentionFilterControl
      filters={filters}
      onFiltersChange={onFiltersChange}
      dashboardBaselineMentionFilters={dashboardBaselineMentionFilters}
    />
  );

  return { onFiltersChange, ...renderResult };
}
describe("MentionFilterControl", () => {
  it("shows a collapsed mobile summary by default", () => {
    const { container } = renderMentionFilterControl(
      dashboardBaselineMentionFilters
    );

    const mobileSummaryButton = container.querySelector(
      'button[aria-controls="mobile-mention-filter-panel"]'
    );

    expect(mobileSummaryButton).toBeInTheDocument();
    expect(mobileSummaryButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Default view")).toBeInTheDocument();
    expect(screen.getByText("All filters")).toBeInTheDocument();
    expect(
      document.getElementById("mobile-mention-filter-panel")
    ).not.toBeInTheDocument();
  });

  it("shows active filter summary and expands inline on tap", () => {
    const { container } = renderMentionFilterControl({
      ...dashboardBaselineMentionFilters,
      model: "chatgpt",
      sentiment: "positive",
    });

    const mobileSummaryButton = container.querySelector(
      'button[aria-controls="mobile-mention-filter-panel"]'
    );

    expect(mobileSummaryButton).toBeInTheDocument();
    expect(screen.getByText("2 active")).toBeInTheDocument();
    expect(screen.getByText("ChatGPT • Positive")).toBeInTheDocument();

    fireEvent.click(mobileSummaryButton);

    expect(mobileSummaryButton).toHaveAttribute("aria-expanded", "true");
    expect(
      document.getElementById("mobile-mention-filter-panel")
    ).toBeInTheDocument();
  });

  it("shows reset inside the expanded mobile panel", () => {
    const { container } = renderMentionFilterControl({
      ...dashboardBaselineMentionFilters,
      model: "claude",
    });

    const mobileSummaryButton = container.querySelector(
      'button[aria-controls="mobile-mention-filter-panel"]'
    );
    expect(mobileSummaryButton).toBeInTheDocument();
    fireEvent.click(mobileSummaryButton as HTMLElement);

    const mobileFilterPanel = document.getElementById("mobile-mention-filter-panel");
    expect(mobileFilterPanel).toBeInTheDocument();
    expect(
      within(mobileFilterPanel as HTMLElement).getByRole("button", {
        name: /reset/i,
      })
    ).toBeInTheDocument();
  });

  it("renders the mobile field stack when expanded", () => {
    const { container } = renderMentionFilterControl(
      dashboardBaselineMentionFilters
    );

    const mobileSummaryButton = container.querySelector(
      'button[aria-controls="mobile-mention-filter-panel"]'
    );
    expect(mobileSummaryButton).toBeInTheDocument();
    fireEvent.click(mobileSummaryButton as HTMLElement);

    const mobileFilterPanel = document.getElementById("mobile-mention-filter-panel");
    expect(mobileFilterPanel).toBeInTheDocument();
    expect(
      within(mobileFilterPanel as HTMLElement).getByText("Date range")
    ).toBeInTheDocument();
    expect(
      within(mobileFilterPanel as HTMLElement).getByText("From")
    ).toBeInTheDocument();
    expect(
      within(mobileFilterPanel as HTMLElement).getByText("To")
    ).toBeInTheDocument();
  });
});
