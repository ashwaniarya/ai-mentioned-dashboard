import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrendChart } from "@/components/trend-chart";
import type { TrendPoint } from "@/models";
import { brandMentionsApiService } from "@/services";
import { toast } from "sonner";

vi.mock("@/services", () => ({
  brandMentionsApiService: {
    useTrends: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

const useTrendsMock = vi.mocked(brandMentionsApiService.useTrends);
const toastErrorMock = vi.mocked(toast.error);

const sampleTrends: TrendPoint[] = [
  { date: "2025-03-01", total: 50, mentioned: 20 },
  { date: "2025-03-02", total: 60, mentioned: 25 },
  { date: "2025-03-03", total: 40, mentioned: 15 },
];

describe("TrendChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes the full filter payload to useTrends", () => {
    useTrendsMock.mockReturnValue({
      data: { data: sampleTrends },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof brandMentionsApiService.useTrends>);

    render(
      <TrendChart
        filtersForApi={{
          model: "chatgpt",
          sentiment: "positive",
          mentioned: true,
          date_from: "2025-03-01",
          date_to: "2025-03-31",
          mention_date_range_preset: "last_30_days",
        }}
      />
    );

    expect(useTrendsMock).toHaveBeenCalledWith({
      group_by: "day",
      filters: {
        model: "chatgpt",
        sentiment: "positive",
        mentioned: true,
        date_from: "2025-03-01",
        date_to: "2025-03-31",
      },
    });
  });

  it("F10 — renders chart heading with data", () => {
    useTrendsMock.mockReturnValue({
      data: { data: sampleTrends },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof brandMentionsApiService.useTrends>);

    render(<TrendChart filtersForApi={{}} />);
    expect(screen.getAllByText("Mention Trends").length).toBeGreaterThan(0);
  });

  it("shows empty message when data is empty", () => {
    useTrendsMock.mockReturnValue({
      data: { data: [] },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof brandMentionsApiService.useTrends>);

    render(<TrendChart filtersForApi={{}} />);
    expect(screen.getByText(/no trend data/i)).toBeInTheDocument();
  });

  it("shows skeleton when loading", () => {
    useTrendsMock.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof brandMentionsApiService.useTrends>);

    const { container } = render(<TrendChart filtersForApi={{}} />);
    const skeletons = container.querySelectorAll('[class*="skeleton"], [data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows failed state when the trends request fails", () => {
    useTrendsMock.mockReturnValue({
      data: { data: sampleTrends },
      error: new Error("Trend API failed"),
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof brandMentionsApiService.useTrends>);

    render(<TrendChart filtersForApi={{}} />);

    expect(screen.getByText(/unable to load mention trends/i)).toBeInTheDocument();
    expect(toastErrorMock).toHaveBeenCalledWith("Trend API failed");
  });
});
