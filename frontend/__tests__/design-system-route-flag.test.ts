import { afterEach, describe, expect, it, vi } from "vitest";

import { isDesignSystemRouteEnabled } from "@/lib/design-system-route-flag";

describe("isDesignSystemRouteEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true when NEXT_PUBLIC_DESIGN_SYSTEM_ENABLED is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_DESIGN_SYSTEM_ENABLED", undefined);
    expect(isDesignSystemRouteEnabled()).toBe(true);
  });

  it("returns false when env is the string false", () => {
    vi.stubEnv("NEXT_PUBLIC_DESIGN_SYSTEM_ENABLED", "false");
    expect(isDesignSystemRouteEnabled()).toBe(false);
  });
});
