import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LOADER_FADE_DURATION_MS } from "@/config";
import { LoadingFade } from "@/components/ui/loading-fade";

describe("LoadingFade", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the loader mounted until the fade-out duration completes", async () => {
    const { rerender } = render(
      <LoadingFade
        isLoading
        loadingContent={<div>Loading shell</div>}
      >
        <div>Loaded content</div>
      </LoadingFade>
    );

    expect(screen.getByText("Loading shell")).toBeInTheDocument();
    expect(screen.queryByText("Loaded content")).not.toBeInTheDocument();

    rerender(
      <LoadingFade
        isLoading={false}
        loadingContent={<div>Loading shell</div>}
      >
        <div>Loaded content</div>
      </LoadingFade>
    );

    expect(screen.getByText("Loading shell")).toBeInTheDocument();
    expect(screen.getByText("Loaded content")).toBeInTheDocument();

    const contentWrapper = screen.getByText("Loaded content").parentElement;
    expect(contentWrapper).toHaveClass("opacity-100");

    await act(async () => {
      vi.advanceTimersByTime(LOADER_FADE_DURATION_MS);
    });

    expect(screen.queryByText("Loading shell")).not.toBeInTheDocument();
  });
});
