import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "@/lib/use-debounced-value";

describe("useDebouncedValue", () => {
  it("F7 — returns initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("F7 — updates value only after delay", async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    expect(result.current).toBe("a");

    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("b");

    vi.useRealTimers();
  });
});
