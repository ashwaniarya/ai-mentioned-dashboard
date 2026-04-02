import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MentionFiltersResetIconButton } from "@/components/mention-filters/mention-filters-reset-icon-button";

describe("MentionFiltersResetIconButton", () => {
  it("forwards click when enabled", () => {
    const onClick = vi.fn();
    render(
      <MentionFiltersResetIconButton
        ariaLabel="Reset filters"
        disabled={false}
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /reset filters/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire click when disabled", () => {
    const onClick = vi.fn();
    render(
      <MentionFiltersResetIconButton
        ariaLabel="Reset filters"
        disabled
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /reset filters/i }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
