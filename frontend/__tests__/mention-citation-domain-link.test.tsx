import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  MentionCitationDomainLink,
  extractDisplayLabelFromCitationUrl,
} from "@/components/mention-table/mention-citation-domain-link";

describe("extractDisplayLabelFromCitationUrl", () => {
  it("returns hostname for absolute https URL with path and query", () => {
    expect(
      extractDisplayLabelFromCitationUrl(
        "https://news.example.com/path/to/page?q=1"
      )
    ).toBe("news.example.com");
  });

  it("returns hostname for http URL", () => {
    expect(
      extractDisplayLabelFromCitationUrl("http://api.example.org/v1")
    ).toBe("api.example.org");
  });

  it("truncates raw string when URL parsing fails and string is long", () => {
    const raw =
      "not-a-valid-url-without-scheme-and-very-long-segment-here";
    const label = extractDisplayLabelFromCitationUrl(raw);
    expect(label).toHaveLength(25);
    expect(label.endsWith("…")).toBe(true);
    expect(label.startsWith("not-a-valid-url-without")).toBe(true);
  });

  it("returns trimmed raw string when short and URL parsing fails", () => {
    expect(extractDisplayLabelFromCitationUrl("short-path")).toBe("short-path");
  });
});

describe("MentionCitationDomainLink", () => {
  it("renders link with href, title, and visible hostname", () => {
    const url = "https://docs.example.com/guide#intro";
    render(<MentionCitationDomainLink citationUrl={url} />);

    const link = screen.getByRole("link", { name: /docs\.example\.com/i });
    expect(link).toHaveAttribute("href", url);
    expect(link).toHaveAttribute("title", url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.textContent).toContain("docs.example.com");
  });

  it("renders fallback label when URL is not parseable", () => {
    const raw = "relative/path/only";
    render(<MentionCitationDomainLink citationUrl={raw} />);

    const link = screen.getByRole("link", { name: "relative/path/only" });
    expect(link).toHaveAttribute("href", raw);
  });
});
