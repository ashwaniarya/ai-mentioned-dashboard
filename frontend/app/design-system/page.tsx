import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DesignSystemBackLink } from "@/app/design-system/design-system-back-link"
import { DesignSystemSelectDemo } from "@/app/design-system/design-system-select-demo"
import { DesignSystemThemeToggle } from "@/app/design-system/design-system-theme-toggle"
import { MentionModelChip } from "@/components/mention-table/mention-model-chip"
import { Badge } from "@/components/ui/badge"
import { Chip, type ChipTone } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
} from "@/components/ui/typography"
import { isDesignSystemRouteEnabled } from "@/lib/design-system-route-flag"

export const metadata: Metadata = {
  title: "Design system",
  description:
    "Brand Mentions dashboard — tokens, typography, and UI atoms for review.",
}

const navLinks = [
  { href: "#foundations", label: "Foundations" },
  { href: "#typography", label: "Typography" },
  { href: "#buttons", label: "Buttons" },
  { href: "#badges", label: "Badges" },
  { href: "#chips", label: "Chips" },
  { href: "#cards", label: "Cards" },
  { href: "#select", label: "Select" },
  { href: "#table", label: "Table" },
] as const

const chipToneGallery: ChipTone[] = [
  "neutral",
  "primary",
  "success",
  "warning",
  "info",
  "destructive",
  "chart1",
  "chart2",
  "chart3",
  "chart4",
  "chart5",
]

const colorTokens = [
  { name: "--background", utility: "bg-background", fg: "text-foreground" },
  { name: "--foreground", utility: "bg-foreground", fg: "text-background" },
  { name: "--card", utility: "bg-card", fg: "text-card-foreground" },
  { name: "--primary", utility: "bg-primary", fg: "text-primary-foreground" },
  {
    name: "--secondary",
    utility: "bg-secondary",
    fg: "text-secondary-foreground",
  },
  { name: "--muted", utility: "bg-muted", fg: "text-muted-foreground" },
  { name: "--accent", utility: "bg-accent", fg: "text-accent-foreground" },
  {
    name: "--destructive",
    utility: "bg-destructive",
    fg: "text-destructive-foreground",
  },
  {
    name: "--success",
    utility: "bg-success",
    fg: "text-success-foreground",
  },
  {
    name: "--warning",
    utility: "bg-warning",
    fg: "text-warning-foreground",
  },
  { name: "--info", utility: "bg-info", fg: "text-info-foreground" },
  { name: "--border", utility: "bg-border", fg: "text-foreground" },
] as const

const surfaceNeutralTokens = [
  {
    name: "--surface-sunken",
    utility: "bg-surface-sunken",
    fg: "text-foreground",
  },
  {
    name: "--surface-raised",
    utility: "bg-surface-raised",
    fg: "text-foreground",
  },
  {
    name: "--border-strong",
    utility: "bg-border-strong",
    fg: "text-foreground",
  },
  { name: "--neutral-1", utility: "bg-neutral-1", fg: "text-foreground" },
  { name: "--neutral-2", utility: "bg-neutral-2", fg: "text-foreground" },
  { name: "--neutral-3", utility: "bg-neutral-3", fg: "text-neutral-1" },
  { name: "--neutral-4", utility: "bg-neutral-4", fg: "text-neutral-1" },
  { name: "--neutral-5", utility: "bg-neutral-5", fg: "text-neutral-1" },
] as const

const chartColorTokens = [
  { name: "--chart-1", utility: "bg-chart-1" },
  { name: "--chart-2", utility: "bg-chart-2" },
  { name: "--chart-3", utility: "bg-chart-3" },
  { name: "--chart-4", utility: "bg-chart-4" },
  { name: "--chart-5", utility: "bg-chart-5" },
] as const

const modelMentionColorTokens = [
  {
    name: "chatgpt",
    bgUtility: "bg-model-chatgpt-bg",
    fgUtility: "text-model-chatgpt-fg",
  },
  {
    name: "gemini",
    bgUtility: "bg-model-gemini-bg",
    fgUtility: "text-model-gemini-fg",
  },
  {
    name: "perplexity",
    bgUtility: "bg-model-perplexity-bg",
    fgUtility: "text-model-perplexity-fg",
  },
  {
    name: "claude",
    bgUtility: "bg-model-claude-bg",
    fgUtility: "text-model-claude-fg",
  },
] as const

const elevationRows = [
  { token: "--elevation-subtle", utility: "shadow-dashboard-subtle" },
  { token: "--elevation-card", utility: "shadow-dashboard-card" },
  { token: "--elevation-popover", utility: "shadow-dashboard-popover" },
  { token: "--elevation-modal", utility: "shadow-dashboard-modal" },
] as const

const typeTokenRows = [
  ["--dashboard-type-display-size", "text-dashboard-display"],
  ["--dashboard-type-page-title-size", "text-dashboard-page-title"],
  ["--dashboard-type-section-size", "text-dashboard-section"],
  ["--dashboard-type-subsection-size", "text-dashboard-subsection"],
  ["--dashboard-type-lead-size", "text-dashboard-lead"],
  ["--dashboard-type-body-size", "text-dashboard-body"],
  ["--dashboard-type-supporting-size", "text-dashboard-supporting"],
  ["--dashboard-type-caption-size", "text-dashboard-caption"],
  ["--dashboard-type-overline-size", "text-dashboard-overline"],
  ["--dashboard-type-code-size", "text-dashboard-code"],
] as const

const motionRows = [
  ["--dashboard-motion-duration-fast", "150ms"],
  ["--dashboard-motion-duration-default", "200ms"],
  ["--dashboard-motion-duration-slow", "280ms"],
  ["--dashboard-motion-easing-standard", "cubic-bezier"],
] as const

const spacingRows = [
  ["--dashboard-space-xs", "spacing-dashboard-xs"],
  ["--dashboard-space-sm", "spacing-dashboard-sm"],
  ["--dashboard-space-md", "spacing-dashboard-md"],
  ["--dashboard-space-lg", "spacing-dashboard-lg"],
  ["--dashboard-space-xl", "spacing-dashboard-xl"],
  ["--dashboard-space-2xl", "spacing-dashboard-2xl"],
  ["--dashboard-space-section", "spacing-dashboard-section"],
] as const

export default function DesignSystemPage() {
  if (!isDesignSystemRouteEnabled()) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-5xl flex-col gap-dashboard-md px-dashboard-lg py-dashboard-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-dashboard-sm">
            <DashboardOverlineText>Gallery</DashboardOverlineText>
            <DashboardDisplayHeading className="text-balance">
              Design system
            </DashboardDisplayHeading>
            <DashboardSupportingText>
              Tokens, type, and atoms for the Brand Mentions dashboard.
            </DashboardSupportingText>
          </div>
          <div className="flex flex-wrap items-center gap-dashboard-sm">
            <DesignSystemThemeToggle />
            <DesignSystemBackLink />
          </div>
        </div>
        <nav
          aria-label="On this page"
          className="mx-auto max-w-5xl border-t border-border px-dashboard-lg py-dashboard-sm"
        >
          <ul className="flex flex-wrap gap-x-dashboard-lg gap-y-dashboard-sm text-dashboard-supporting">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl space-y-dashboard-section px-dashboard-lg py-dashboard-xl">
        <section
          id="foundations"
          className="scroll-mt-28 space-y-dashboard-lg"
        >
          <DashboardSectionHeading>Foundations</DashboardSectionHeading>
          <DashboardBodyText>
            Semantic colors reference{" "}
            <DashboardInlineCode>design-tokens.css</DashboardInlineCode> and{" "}
            <DashboardInlineCode>@theme inline</DashboardInlineCode> in{" "}
            <DashboardInlineCode>globals.css</DashboardInlineCode>.
          </DashboardBodyText>

          <DashboardSubsectionHeading>Semantic colors</DashboardSubsectionHeading>
          <DashboardSupportingText>
            Primary accent is brand blue (Facebook #1877F2 axis via design tokens);
            neutrals stay violet-tinted; status pairs for product UI.
          </DashboardSupportingText>
          <div className="grid gap-dashboard-md sm:grid-cols-2 lg:grid-cols-3">
            {colorTokens.map(({ name, utility, fg }) => (
              <div
                key={name}
                className="flex flex-col gap-dashboard-sm rounded-xl border border-border p-dashboard-md shadow-dashboard-subtle"
              >
                <div
                  className={`h-14 w-full rounded-lg ${utility} flex items-center justify-center ${fg} text-dashboard-caption font-medium`}
                >
                  Swatch
                </div>
                <DashboardCaptionText className="font-mono">
                  {name}
                </DashboardCaptionText>
              </div>
            ))}
          </div>

          <DashboardSubsectionHeading>
            Surfaces and neutral ramp
          </DashboardSubsectionHeading>
          <DashboardSupportingText>
            Extra tokens for depth and brand-tinted grays; use alongside core
            semantic names.
          </DashboardSupportingText>
          <div className="grid gap-dashboard-md sm:grid-cols-2 lg:grid-cols-4">
            {surfaceNeutralTokens.map(({ name, utility, fg }) => (
              <div
                key={name}
                className="flex flex-col gap-dashboard-sm rounded-xl border border-border p-dashboard-md shadow-dashboard-subtle"
              >
                <div
                  className={`flex h-14 w-full items-center justify-center rounded-lg ${utility} ${fg} text-dashboard-caption font-medium`}
                >
                  Swatch
                </div>
                <DashboardCaptionText className="font-mono">
                  {name}
                </DashboardCaptionText>
              </div>
            ))}
          </div>

          <DashboardSubsectionHeading>Chart series</DashboardSubsectionHeading>
          <div className="flex flex-wrap gap-dashboard-md">
            {chartColorTokens.map(({ name, utility }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-dashboard-sm"
              >
                <div
                  className={`size-14 rounded-xl border border-border shadow-dashboard-subtle ${utility}`}
                />
                <DashboardCaptionText className="font-mono">
                  {name}
                </DashboardCaptionText>
              </div>
            ))}
          </div>

          <DashboardSubsectionHeading>
            Mention model surfaces
          </DashboardSubsectionHeading>
          <DashboardSupportingText>
            Table chips and model filter: background wash + icon ink. Marks are
            third-party trademarks.
          </DashboardSupportingText>
          <div className="grid gap-dashboard-md sm:grid-cols-2 lg:grid-cols-4">
            {modelMentionColorTokens.map(({ name, bgUtility, fgUtility }) => (
              <div
                key={name}
                className="flex flex-col gap-dashboard-sm rounded-xl border border-border p-dashboard-md shadow-dashboard-subtle"
              >
                <div
                  className={`flex h-14 w-full items-center justify-center rounded-lg ${bgUtility} ${fgUtility} text-dashboard-caption font-semibold`}
                >
                  Aa
                </div>
                <DashboardCaptionText className="font-mono">
                  --model-{name}-bg / -fg
                </DashboardCaptionText>
              </div>
            ))}
          </div>

          <DashboardSubsectionHeading>Elevation</DashboardSubsectionHeading>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CSS variable</TableHead>
                <TableHead>Tailwind utility</TableHead>
                <TableHead>Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elevationRows.map(({ token, utility }) => (
                <TableRow key={token}>
                  <TableCell className="font-mono text-dashboard-supporting">
                    {token}
                  </TableCell>
                  <TableCell className="font-mono text-dashboard-supporting">
                    {utility}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`h-10 w-24 rounded-md bg-card ${utility}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DashboardSubsectionHeading>Type tokens</DashboardSubsectionHeading>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variable</TableHead>
                <TableHead>Utility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typeTokenRows.map(([variable, utility]) => (
                <TableRow key={variable}>
                  <TableCell className="font-mono text-dashboard-supporting">
                    {variable}
                  </TableCell>
                  <TableCell className="font-mono text-dashboard-supporting">
                    {utility}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DashboardSubsectionHeading>Spacing</DashboardSubsectionHeading>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variable</TableHead>
                <TableHead>Spacing utility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spacingRows.map(([variable, utility]) => (
                <TableRow key={variable}>
                  <TableCell className="font-mono text-dashboard-supporting">
                    {variable}
                  </TableCell>
                  <TableCell className="font-mono text-dashboard-supporting">
                    {utility}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DashboardSubsectionHeading>Motion</DashboardSubsectionHeading>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variable</TableHead>
                <TableHead>Value / note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {motionRows.map(([variable, note]) => (
                <TableRow key={variable}>
                  <TableCell className="font-mono text-dashboard-supporting">
                    {variable}
                  </TableCell>
                  <TableCell className="text-dashboard-supporting">
                    {note}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section id="typography" className="scroll-mt-28 space-y-dashboard-lg">
          <DashboardSectionHeading>Typography</DashboardSectionHeading>
          <DashboardBodyText>
            Components from{" "}
            <DashboardInlineCode>components/ui/typography.tsx</DashboardInlineCode>
            . Pair with token utilities such as{" "}
            <DashboardInlineCode>text-dashboard-body</DashboardInlineCode>.
          </DashboardBodyText>

          <DashboardSupportingText>
            The page hero uses{" "}
            <DashboardInlineCode>DashboardDisplayHeading</DashboardInlineCode>{" "}
            (single <DashboardInlineCode>h1</DashboardInlineCode> per view).
          </DashboardSupportingText>

          <div className="space-y-dashboard-xl">
            <figure className="space-y-dashboard-sm rounded-xl border border-border p-dashboard-lg shadow-dashboard-subtle">
              <DashboardCaptionText>Page title · h2</DashboardCaptionText>
              <DashboardPageTitle>Brand Mentions</DashboardPageTitle>
              <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
                {`<DashboardPageTitle>…</DashboardPageTitle>`}
              </pre>
            </figure>

            <figure className="space-y-dashboard-sm rounded-xl border border-border p-dashboard-lg shadow-dashboard-subtle">
              <DashboardCaptionText>Section · h2</DashboardCaptionText>
              <DashboardSectionHeading>Filters & date range</DashboardSectionHeading>
              <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
                {`<DashboardSectionHeading>…</DashboardSectionHeading>`}
              </pre>
            </figure>

            <figure className="space-y-dashboard-sm rounded-xl border border-border p-dashboard-lg shadow-dashboard-subtle">
              <DashboardCaptionText>Subsection · h3</DashboardCaptionText>
              <DashboardSubsectionHeading>Source breakdown</DashboardSubsectionHeading>
              <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
                {`<DashboardSubsectionHeading>…</DashboardSubsectionHeading>`}
              </pre>
            </figure>

            <figure className="space-y-dashboard-sm rounded-xl border border-border p-dashboard-lg shadow-dashboard-subtle">
              <DashboardCaptionText>Lead</DashboardCaptionText>
              <DashboardLeadText>
                See how mentions move over time and which channels drive the
                spike.
              </DashboardLeadText>
              <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
                {`<DashboardLeadText>…</DashboardLeadText>`}
              </pre>
            </figure>

            <figure className="space-y-dashboard-sm rounded-xl border border-border p-dashboard-lg shadow-dashboard-subtle">
              <DashboardCaptionText>Body</DashboardCaptionText>
              <DashboardBodyText>
                Use filters to narrow by platform, sentiment, or keyword. Export
                when you need a snapshot for stakeholders.
              </DashboardBodyText>
              <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
                {`<DashboardBodyText>…</DashboardBodyText>`}
              </pre>
            </figure>

            <figure className="space-y-dashboard-sm rounded-xl border border-border p-dashboard-lg shadow-dashboard-subtle">
              <DashboardCaptionText>Supporting</DashboardCaptionText>
              <DashboardSupportingText>
                Last synced less than a minute ago · data may lag during peak
                load.
              </DashboardSupportingText>
              <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
                {`<DashboardSupportingText>…</DashboardSupportingText>`}
              </pre>
            </figure>

            <figure className="space-y-dashboard-sm rounded-xl border border-border p-dashboard-lg shadow-dashboard-subtle">
              <DashboardCaptionText>Caption</DashboardCaptionText>
              <DashboardCaptionText>
                Figure 1 — Mentions by week, normalized to baseline.
              </DashboardCaptionText>
              <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
                {`<DashboardCaptionText>…</DashboardCaptionText>`}
              </pre>
            </figure>

            <figure className="space-y-dashboard-sm rounded-xl border border-border p-dashboard-lg shadow-dashboard-subtle">
              <DashboardCaptionText>Overline</DashboardCaptionText>
              <DashboardOverlineText>Live metrics</DashboardOverlineText>
              <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
                {`<DashboardOverlineText>…</DashboardOverlineText>`}
              </pre>
            </figure>

            <figure className="space-y-dashboard-sm rounded-xl border border-border p-dashboard-lg shadow-dashboard-subtle">
              <DashboardCaptionText>Quote</DashboardCaptionText>
              <DashboardQuoteText>
                “The dashboard turned a wall of mentions into a story we could
                act on.”
              </DashboardQuoteText>
              <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
                {`<DashboardQuoteText>…</DashboardQuoteText>`}
              </pre>
            </figure>

            <figure className="space-y-dashboard-sm rounded-xl border border-border p-dashboard-lg shadow-dashboard-subtle">
              <DashboardCaptionText>Inline code</DashboardCaptionText>
              <DashboardBodyText>
                Call <DashboardInlineCode>GET /api/mentions</DashboardInlineCode>{" "}
                with your workspace id.
              </DashboardBodyText>
              <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
                {`<DashboardInlineCode>…</DashboardInlineCode>`}
              </pre>
            </figure>

            <figure className="space-y-dashboard-sm rounded-xl border border-border p-dashboard-lg shadow-dashboard-subtle">
              <DashboardCaptionText>Text link</DashboardCaptionText>
              <DashboardBodyText>
                Open the{" "}
                <DashboardTextLink href="/">main dashboard</DashboardTextLink>{" "}
                or read{" "}
                <DashboardTextLink href="#foundations">
                  foundations
                </DashboardTextLink>
                .
              </DashboardBodyText>
              <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
                {`<DashboardTextLink href="…">…</DashboardTextLink>`}
              </pre>
            </figure>
          </div>
        </section>

        <section id="buttons" className="scroll-mt-28 space-y-dashboard-lg">
          <DashboardSectionHeading>Buttons</DashboardSectionHeading>
          <DashboardSupportingText>
            Variants from <DashboardInlineCode>button.tsx</DashboardInlineCode>.
          </DashboardSupportingText>
          <div className="flex flex-wrap gap-dashboard-md">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-dashboard-md">
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
            {`<Button variant="outline" size="sm">…</Button>`}
          </pre>
        </section>

        <section id="badges" className="scroll-mt-28 space-y-dashboard-lg">
          <DashboardSectionHeading>Badges</DashboardSectionHeading>
          <DashboardSupportingText>
            Semantic status variants map to{" "}
            <DashboardInlineCode>success</DashboardInlineCode>,{" "}
            <DashboardInlineCode>warning</DashboardInlineCode>,{" "}
            <DashboardInlineCode>info</DashboardInlineCode> tokens.
          </DashboardSupportingText>
          <div className="flex flex-wrap gap-dashboard-md">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
            {`<Badge variant="success">Live</Badge>`}
          </pre>
        </section>

        <section id="chips" className="scroll-mt-28 space-y-dashboard-lg">
          <DashboardSectionHeading>Chips</DashboardSectionHeading>
          <DashboardSupportingText>
            Dense, categorical labels for tables and filters. Subtle chips use a
            neutral hairline border and put weight on{" "}
            <DashboardInlineCode>text-foreground</DashboardInlineCode> (or muted for
            neutral tone), not on hue-matched borders. Prefer{" "}
            <DashboardInlineCode>Chip</DashboardInlineCode> for scan-heavy grids;
            use <DashboardInlineCode>Badge</DashboardInlineCode> for pill-shaped
            emphasis and marketing-style tags.
          </DashboardSupportingText>
          <div className="space-y-dashboard-md">
            <div className="space-y-dashboard-sm">
              <DashboardSubsectionHeading>Subtle</DashboardSubsectionHeading>
              <div className="flex flex-wrap gap-dashboard-sm">
                {chipToneGallery.map((tone) => (
                  <Chip key={`subtle-${tone}`} variant="subtle" tone={tone}>
                    {tone}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-dashboard-sm">
              <DashboardSubsectionHeading>Outline</DashboardSubsectionHeading>
              <div className="flex flex-wrap gap-dashboard-sm">
                {chipToneGallery.map((tone) => (
                  <Chip key={`outline-${tone}`} variant="outline" tone={tone}>
                    {tone}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-dashboard-sm">
              <DashboardSubsectionHeading>Solid</DashboardSubsectionHeading>
              <div className="flex flex-wrap gap-dashboard-sm">
                {chipToneGallery.map((tone) => (
                  <Chip key={`solid-${tone}`} variant="solid" tone={tone}>
                    {tone}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-dashboard-sm">
              <DashboardSubsectionHeading>
                Mention model chips
              </DashboardSubsectionHeading>
              <DashboardSupportingText>
                Same component as the mentions table model column; hues align
                with chart series tokens.
              </DashboardSupportingText>
              <div className="flex flex-wrap gap-dashboard-sm">
                <MentionModelChip model="chatgpt" />
                <MentionModelChip model="gemini" />
                <MentionModelChip model="perplexity" />
                <MentionModelChip model="claude" />
                <MentionModelChip model="unknown_vendor" />
              </div>
            </div>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
            {`<Chip variant="subtle" tone="info">Beta</Chip>
<MentionModelChip model="chatgpt" />`}
          </pre>
        </section>

        <section id="cards" className="scroll-mt-28 space-y-dashboard-lg">
          <DashboardSectionHeading>Cards</DashboardSectionHeading>
          <div className="grid gap-dashboard-lg md:grid-cols-2">
            <Card className="shadow-dashboard-card">
              <CardHeader>
                <CardTitle>Mentions trend</CardTitle>
                <CardDescription>
                  Rolling seven-day volume vs prior week.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardBodyText>
                  Card content uses body text for readable paragraphs inside
                  surfaces.
                </DashboardBodyText>
              </CardContent>
              <CardFooter className="flex gap-dashboard-sm">
                <Badge variant="secondary">+12%</Badge>
                <DashboardCaptionText>Updated hourly</DashboardCaptionText>
              </CardFooter>
            </Card>
            <Card size="sm" className="shadow-dashboard-subtle">
              <CardHeader>
                <CardTitle>Compact card</CardTitle>
                <CardDescription>Smaller padding preset.</CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardSupportingText>
                  Use for dense stacks or side panels.
                </DashboardSupportingText>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="select" className="scroll-mt-28 space-y-dashboard-lg">
          <DashboardSectionHeading>Select</DashboardSectionHeading>
          <DashboardSupportingText>
            Grouped items follow the shadcn composition rules.
          </DashboardSupportingText>
          <DesignSystemSelectDemo />
          <pre className="overflow-x-auto rounded-lg bg-muted p-dashboard-md font-mono text-dashboard-caption text-muted-foreground">
            {`<Select defaultValue="apple">
  <SelectTrigger className="w-[220px]">
    <SelectValue placeholder="Pick a fruit" />
  </SelectTrigger>
  <SelectContent>…</SelectContent>
</Select>`}
          </pre>
        </section>

        <section id="table" className="scroll-mt-28 space-y-dashboard-lg">
          <DashboardSectionHeading>Table</DashboardSectionHeading>
          <Table>
            <TableCaption>Sample mention rows for layout review.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Snippet</TableHead>
                <TableHead className="text-right">Sentiment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow data-state="selected">
                <TableCell className="font-medium">News</TableCell>
                <TableCell>“Brand launches summer drop…”</TableCell>
                <TableCell className="text-right">
                  <Chip variant="subtle" tone="success">
                    Positive
                  </Chip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Social</TableCell>
                <TableCell>Thread about pricing…</TableCell>
                <TableCell className="text-right">
                  <Chip variant="subtle" tone="info">
                    Neutral
                  </Chip>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>
      </main>
    </div>
  )
}
