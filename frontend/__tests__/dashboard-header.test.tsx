import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardHeader } from "@/components/dashboard-header";

describe("DashboardHeader", () => {
  it("renders title, subtitle, decorative mark, and color scheme toggle", () => {
    const { container } = render(<DashboardHeader />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Track Your Brand");
    expect(heading.className).toContain("--dashboard-type-section-size");

    expect(
      screen.getByText(
        "Track how your brand is mentioned across AI models",
      ),
    ).toBeInTheDocument();

    const mark = container.querySelector('[aria-hidden="true"]');
    expect(mark?.querySelector("svg")).toBeTruthy();

    expect(
      screen.getByRole("button", { name: /switch to dark mode/i }),
    ).toBeInTheDocument();
  });
});
