import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Chip } from "@/components/ui/chip"

describe("Chip", () => {
  it("renders a span with data-slot chip", () => {
    render(
      <Chip variant="subtle" tone="neutral">
        Label
      </Chip>
    )
    const el = screen.getByText("Label")
    expect(el.tagName).toBe("SPAN")
    expect(el).toHaveAttribute("data-slot", "chip")
  })

  it("applies semantic success classes for subtle success tone", () => {
    render(
      <Chip variant="subtle" tone="success">
        Live
      </Chip>
    )
    const el = screen.getByText("Live")
    expect(el.className).toMatch(/success/)
    expect(el.className).not.toMatch(/emerald|green-\d/)
  })

  it("applies chart token classes for subtle chart1 tone", () => {
    render(
      <Chip variant="subtle" tone="chart1">
        Series A
      </Chip>
    )
    const el = screen.getByText("Series A")
    expect(el.className).toMatch(/chart-1/)
  })
})
