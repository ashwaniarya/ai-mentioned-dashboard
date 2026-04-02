import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  DashboardBodyText,
  DashboardCaptionText,
  DashboardDisplayHeading,
  DashboardInlineCode,
  DashboardLeadText,
  DashboardOverlineText,
  DashboardPageTitle,
  DashboardQuoteText,
  DashboardSectionHeading,
  DashboardSubsectionHeading,
  DashboardSupportingText,
  DashboardTextLink,
} from "@/components/ui/typography";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
    ...rest
  }: React.ComponentProps<"a"> & { href: string }) => (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  ),
}));

describe("Dashboard typography atoms", () => {
  it("DashboardDisplayHeading renders h1 with display role", () => {
    render(<DashboardDisplayHeading>Display</DashboardDisplayHeading>);
    const el = screen.getByRole("heading", { level: 1 });
    expect(el).toHaveTextContent("Display");
    expect(el).toHaveAttribute("data-dashboard-typography-role", "display");
    expect(el.className).toContain("--dashboard-type-display-size");
  });

  it("DashboardPageTitle renders h2 with page-title role", () => {
    render(<DashboardPageTitle>Page</DashboardPageTitle>);
    const el = screen.getByRole("heading", { level: 2 });
    expect(el).toHaveAttribute("data-dashboard-typography-role", "page-title");
    expect(el.className).toContain("--dashboard-type-page-title-size");
  });

  it("DashboardSectionHeading renders h2 with section role", () => {
    render(<DashboardSectionHeading>Section</DashboardSectionHeading>);
    const el = screen.getByRole("heading", { level: 2 });
    expect(el).toHaveAttribute("data-dashboard-typography-role", "section");
    expect(el.className).toContain("--dashboard-type-section-size");
  });

  it("DashboardSubsectionHeading renders h3", () => {
    render(<DashboardSubsectionHeading>Sub</DashboardSubsectionHeading>);
    const el = screen.getByRole("heading", { level: 3 });
    expect(el).toHaveAttribute("data-dashboard-typography-role", "subsection");
    expect(el.className).toContain("--dashboard-type-subsection-size");
  });

  it("DashboardLeadText renders paragraph with lead utility", () => {
    render(<DashboardLeadText>Lead copy</DashboardLeadText>);
    const el = screen.getByText("Lead copy");
    expect(el.tagName).toBe("P");
    expect(el).toHaveAttribute("data-dashboard-typography-role", "lead");
    expect(el.className).toContain("--dashboard-type-lead-size");
  });

  it("DashboardBodyText renders paragraph with body utility", () => {
    render(<DashboardBodyText>Body</DashboardBodyText>);
    const el = screen.getByText("Body");
    expect(el).toHaveAttribute("data-dashboard-typography-role", "body");
    expect(el.className).toContain("--dashboard-type-body-size");
  });

  it("DashboardSupportingText uses muted foreground utility", () => {
    render(<DashboardSupportingText>Help</DashboardSupportingText>);
    const el = screen.getByText("Help");
    expect(el).toHaveAttribute("data-dashboard-typography-role", "supporting");
    expect(el.className).toContain("text-muted-foreground");
    expect(el.className).toContain("--dashboard-type-supporting-size");
  });

  it("DashboardCaptionText uses caption utility", () => {
    render(<DashboardCaptionText>Cap</DashboardCaptionText>);
    const el = screen.getByText("Cap");
    expect(el).toHaveAttribute("data-dashboard-typography-role", "caption");
    expect(el.className).toContain("--dashboard-type-caption-size");
  });

  it("DashboardOverlineText uses overline utility", () => {
    render(<DashboardOverlineText>Over</DashboardOverlineText>);
    const el = screen.getByText("Over");
    expect(el).toHaveAttribute("data-dashboard-typography-role", "overline");
    expect(el.className).toContain("--dashboard-type-overline-size");
  });

  it("DashboardQuoteText renders blockquote", () => {
    render(<DashboardQuoteText>Quoted</DashboardQuoteText>);
    const el = screen.getByText("Quoted");
    expect(el.tagName).toBe("BLOCKQUOTE");
    expect(el).toHaveAttribute("data-dashboard-typography-role", "quote");
  });

  it("DashboardInlineCode renders code with dashboard-code utility", () => {
    render(<DashboardInlineCode>fn()</DashboardInlineCode>);
    const el = screen.getByText("fn()");
    expect(el.tagName).toBe("CODE");
    expect(el).toHaveAttribute("data-dashboard-typography-role", "inline-code");
    expect(el.className).toContain("--dashboard-type-code-size");
  });

  it("DashboardTextLink renders anchor with link role", () => {
    render(
      <DashboardTextLink href="/x">Go</DashboardTextLink>
    );
    const el = screen.getByRole("link", { name: "Go" });
    expect(el).toHaveAttribute("href", "/x");
    expect(el).toHaveAttribute("data-dashboard-typography-role", "link");
    expect(el.className).toContain("text-primary");
  });
});
