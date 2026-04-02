"use client";

import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";

/** Tailwind max-width for the hostname span so the table cell stays compact. */
const MENTION_CITATION_DOMAIN_LABEL_MAX_WIDTH_CLASS = "max-w-[140px]";

/** When `new URL` fails, show this many characters of the raw string before ellipsis. */
const MENTION_CITATION_FALLBACK_LABEL_MAX_CHARACTERS = 24;

function extractDisplayLabelFromCitationUrl(citationUrl: string): string {
  try {
    return new URL(citationUrl).hostname || citationUrl;
  } catch {
    const trimmed = citationUrl.trim();
    if (!trimmed) {
      return citationUrl;
    }
    if (trimmed.length <= MENTION_CITATION_FALLBACK_LABEL_MAX_CHARACTERS) {
      return trimmed;
    }
    return `${trimmed.slice(0, MENTION_CITATION_FALLBACK_LABEL_MAX_CHARACTERS)}…`;
  }
}

type MentionCitationDomainLinkProps = {
  citationUrl: string;
  className?: string;
};

function MentionCitationDomainLink({
  citationUrl,
  className,
}: MentionCitationDomainLinkProps) {
  const label = extractDisplayLabelFromCitationUrl(citationUrl);

  return (
    <a
      href={citationUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={citationUrl}
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-1 font-medium text-info underline-offset-2 hover:text-info/80 hover:underline",
        className
      )}
    >
      <ExternalLink className="size-4 shrink-0" aria-hidden />
      <span
        className={cn(
          "truncate",
          MENTION_CITATION_DOMAIN_LABEL_MAX_WIDTH_CLASS
        )}
      >
        {label}
      </span>
    </a>
  );
}

export {
  MentionCitationDomainLink,
  extractDisplayLabelFromCitationUrl,
};
