import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MentionsTable } from "@/components/mentions-table";
import type { Mention, MentionsRequest } from "@/models";
import { brandMentionsApiService } from "@/services";
import { toast } from "sonner";

vi.mock("@/services", () => ({
  brandMentionsApiService: {
    useMentions: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

const useMentionsMock = vi.mocked(brandMentionsApiService.useMentions);
const toastErrorMock = vi.mocked(toast.error);

const makeMention = (overrides: Partial<Mention> = {}): Mention => ({
  id: crypto.randomUUID(),
  query_text: "test query",
  model: "chatgpt",
  mentioned: true,
  position: 1,
  sentiment: "positive",
  citation_url: null,
  created_at: "2025-03-01T12:00:00",
  ...overrides,
});

function mockMentionsReturn(overrides: Partial<ReturnType<typeof brandMentionsApiService.useMentions>>) {
  useMentionsMock.mockReturnValue({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  } as ReturnType<typeof brandMentionsApiService.useMentions>);
}

function makeUseMentionsResult(
  overrides: Partial<ReturnType<typeof brandMentionsApiService.useMentions>>
) {
  return {
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  } as ReturnType<typeof brandMentionsApiService.useMentions>;
}

function getPaginationButton(name: RegExp) {
  return screen.getAllByRole("button", { name })[0];
}

describe("MentionsTable", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("F8 — renders correct number of data rows", () => {
    const mentions = Array.from({ length: 3 }, () => makeMention());
    mockMentionsReturn({
      data: { data: mentions, total: 3, page: 1, per_page: 25 },
    });

    render(<MentionsTable filtersForApi={{}} />);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(4);
  });

  it("F9 — shows empty state when no data", () => {
    mockMentionsReturn({
      data: { data: [], total: 0, page: 1, per_page: 25 },
    });

    render(<MentionsTable filtersForApi={{}} />);

    expect(screen.getByText(/no mentions/i)).toBeInTheDocument();
  });

  it("F11 — Prev button disabled on page 1", () => {
    mockMentionsReturn({
      data: { data: [makeMention()], total: 50, page: 1, per_page: 25 },
    });

    render(<MentionsTable filtersForApi={{}} />);

    expect(getPaginationButton(/previous page/i)).toBeDisabled();
  });

  it("F11 — Next button disabled on last page", () => {
    mockMentionsReturn({
      data: { data: [makeMention()], total: 25, page: 1, per_page: 25 },
    });

    render(<MentionsTable filtersForApi={{}} />);

    expect(getPaginationButton(/next page/i)).toBeDisabled();
  });

  it("shows loading skeletons when isLoading is true", () => {
    mockMentionsReturn({
      data: undefined,
      isLoading: true,
    });

    const { container } = render(<MentionsTable filtersForApi={{}} />);
    const skeletons = container.querySelectorAll('[class*="skeleton"], [data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("keeps the previous rows visible while the next page is loading", async () => {
    const pageOneMention = makeMention({ query_text: "page 1 query" });

    useMentionsMock.mockImplementation((request: MentionsRequest) =>
      request.page === 1
        ? makeUseMentionsResult({
            data: { data: [pageOneMention], total: 50, page: 1, per_page: 25 },
          })
        : makeUseMentionsResult({
            data: undefined,
            isLoading: true,
          })
    );

    render(<MentionsTable filtersForApi={{}} />);

    await waitFor(() => {
      expect(screen.getByText("page 1 query")).toBeInTheDocument();
    });

    fireEvent.click(getPaginationButton(/next page/i));

    expect(screen.getAllByText("page 1 query").length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(
        screen.getByTestId("mentions-table-loading-overlay")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("mentions-table-loading-spinner")
      ).toBeInTheDocument();
      expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();
    });
  });

  it("rolls back to the previous page and shows a toast when the next page fails", async () => {
    const pageOneMention = makeMention({ query_text: "page 1 query" });

    useMentionsMock.mockImplementation((request: MentionsRequest) =>
      request.page === 1
        ? makeUseMentionsResult({
            data: { data: [pageOneMention], total: 50, page: 1, per_page: 25 },
          })
        : makeUseMentionsResult({
            data: undefined,
            error: new Error("Mentions API failed"),
          })
    );

    render(<MentionsTable filtersForApi={{}} />);

    fireEvent.click(getPaginationButton(/next page/i));

    await waitFor(() => {
      expect(screen.getAllByText(/page 1 of 2/i).length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText("page 1 query").length).toBeGreaterThan(0);
    expect(
      screen.queryByTestId("mentions-table-loading-overlay")
    ).not.toBeInTheDocument();
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Failed to load page 2. Restored page 1."
    );
  });

  it("shows failed state when the initial mentions request fails", () => {
    mockMentionsReturn({
      data: undefined,
      error: new Error("Mentions API failed"),
    });

    render(<MentionsTable filtersForApi={{}} />);

    expect(screen.getByText(/unable to load brand mentions/i)).toBeInTheDocument();
    expect(toastErrorMock).toHaveBeenCalledWith("Mentions API failed");
  });
});
