import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

describe("SelectTrigger leadingIcon", () => {
  it("renders leading icon and uses aria-label for the combobox accessible name", () => {
    render(
      <Select value="a" onValueChange={() => {}}>
        <SelectTrigger
          aria-label="Test filter field"
          leadingIcon={<span data-testid="select-leading-icon-marker">icon</span>}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByTestId("select-leading-icon-marker")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Test filter field" })).toBeInTheDocument();
  });
});
