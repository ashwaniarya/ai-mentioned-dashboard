import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MentionsTable } from "@/components/mentions-table";
import type { Mention } from "@/models";
import { brandMentionsApiService } from "@/services";

vi.mock("@/services", () => ({
  brandMentionsApiService: {
    useMentions: vi.fn(),
  },
}));

const useMentionsMock = vi.mocked(brandMentionsApiService.useMentions);

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

describe("MentionsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    const buttons = screen.getAllByRole("button");
    const prevButton = buttons.find(
      (b) => b.querySelector("svg.lucide-chevron-left") !== null
    );
    expect(prevButton).toBeDisabled();
  });

  it("F11 — Next button disabled on last page", () => {
    mockMentionsReturn({
      data: { data: [makeMention()], total: 25, page: 1, per_page: 25 },
    });

    render(<MentionsTable filtersForApi={{}} />);

    const buttons = screen.getAllByRole("button");
    const nextButton = buttons.find(
      (b) => b.querySelector("svg.lucide-chevron-right") !== null
    );
    expect(nextButton).toBeDisabled();
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
});
