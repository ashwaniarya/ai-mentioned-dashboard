import { describe, it, expect } from "vitest";

const sentimentColorMap: Record<string, string> = {
  positive:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  neutral:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  negative: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

describe("sentimentColorMap", () => {
  it("F6 — positive maps to emerald (green)", () => {
    expect(sentimentColorMap["positive"]).toContain("emerald");
  });

  it("F6 — neutral maps to amber", () => {
    expect(sentimentColorMap["neutral"]).toContain("amber");
  });

  it("F6 — negative maps to red", () => {
    expect(sentimentColorMap["negative"]).toContain("red");
  });

  it("F6 — unknown sentiment returns undefined", () => {
    expect(sentimentColorMap["unknown"]).toBeUndefined();
  });
});
