import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { MentionFilters, TrendPoint } from "@/models";
import { TrendChart } from "@/components/trend-chart/trend-chart";
import { mentionFiltersToSortedQueryString } from "@/lib/helpers/mention-filters";
import { brandMentionsApiService } from "@/services";
import { toast } from "sonner";

const navigationMocks = vi.hoisted(() => ({
  searchParamsString: "",
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigationMocks.searchParamsString),
  usePathname: () => "/",
  useRouter: () => ({ replace: navigationMocks.replace }),
}));

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

function setWindowWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
}

describe("TrendChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigationMocks.searchParamsString = "";
    navigationMocks.replace.mockClear();
    setWindowWidth(1024);
  });

  it("passes parsed URL chart filters to useTrends with group_by day by default", () => {
    const chartFilters: MentionFilters = {
      model: "chatgpt",
      sentiment: "positive",
      mentioned: true,
      date_from: "2025-03-01",
      date_to: "2025-03-31",
      mention_date_range_preset: "last_30_days",
    };
    navigationMocks.searchParamsString = mentionFiltersToSortedQueryString(
      chartFilters,
      "chart_"
    );

    useTrendsMock.mockReturnValue({
      data: { data: sampleTrends },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof brandMentionsApiService.useTrends>);

    render(<TrendChart />);

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

  it("passes group_by week when chart_group_by is in the URL", () => {
    navigationMocks.searchParamsString = mentionFiltersToSortedQueryString(
      {
        group_by: "week",
        mention_date_range_preset: "maximum",
      },
      "chart_"
    );

    useTrendsMock.mockReturnValue({
      data: { data: sampleTrends },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof brandMentionsApiService.useTrends>);

    render(<TrendChart />);

    expect(useTrendsMock).toHaveBeenCalledWith({
      group_by: "week",
      filters: undefined,
    });
  });

  it("renders trend chart filter controls", () => {
    useTrendsMock.mockReturnValue({
      data: { data: sampleTrends },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof brandMentionsApiService.useTrends>);

    render(<TrendChart />);
    expect(screen.getByRole("button", { name: /date range/i })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: /group by/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Day" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("aria-checked", "false");
  });

  it("checks week radio when chart_group_by is in the URL", () => {
    navigationMocks.searchParamsString = mentionFiltersToSortedQueryString(
      {
        group_by: "week",
        mention_date_range_preset: "maximum",
      },
      "chart_"
    );

    useTrendsMock.mockReturnValue({
      data: { data: sampleTrends },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof brandMentionsApiService.useTrends>);

    render(<TrendChart />);

    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Day" })).toHaveAttribute("aria-checked", "false");
  });

  it("sets chart_group_by in the URL when week radio is chosen", async () => {
    useTrendsMock.mockReturnValue({
      data: { data: sampleTrends },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof brandMentionsApiService.useTrends>);

    render(<TrendChart />);

    fireEvent.click(screen.getByRole("radio", { name: "Week" }));

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalled();
    });

    const lastReplaceUrl = navigationMocks.replace.mock.calls.at(-1)?.[0] as string;
    expect(lastReplaceUrl).toContain("chart_group_by=week");
  });

  it("shows empty message when data is empty", () => {
    useTrendsMock.mockReturnValue({
      data: { data: [] },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof brandMentionsApiService.useTrends>);

    render(<TrendChart />);
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

    const { container } = render(<TrendChart />);
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

    render(<TrendChart />);

    expect(screen.getByText(/unable to load mention trends/i)).toBeInTheDocument();
    expect(toastErrorMock).toHaveBeenCalledWith("Trend API failed");
  });

  it("uses a shorter legend label on mobile screens", async () => {
    setWindowWidth(375);
    useTrendsMock.mockReturnValue({
      data: { data: sampleTrends },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof brandMentionsApiService.useTrends>);

    render(<TrendChart />);

    await waitFor(() => {
      expect(screen.getByText("Total")).toBeInTheDocument();
    });
    expect(screen.queryByText("Total Queries")).not.toBeInTheDocument();
  });
});
