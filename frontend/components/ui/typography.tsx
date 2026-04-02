import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

function DashboardDisplayHeading({
  className,
  ...props
}: React.ComponentProps<"h1">) {
  return (
    <h1
      data-dashboard-typography-role="display"
      className={cn(
        "font-heading font-semibold tracking-[var(--dashboard-type-display-tracking)] text-[length:var(--dashboard-type-display-size)] leading-[var(--dashboard-type-display-line-height)] text-foreground",
        className
      )}
      {...props}
    />
  )
}

function DashboardPageTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      data-dashboard-typography-role="page-title"
      className={cn(
        "font-heading font-semibold text-[length:var(--dashboard-type-page-title-size)] leading-[var(--dashboard-type-page-title-line-height)] text-foreground",
        className
      )}
      {...props}
    />
  )
}

function DashboardSectionHeading({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      data-dashboard-typography-role="section"
      className={cn(
        "font-heading font-semibold text-[length:var(--dashboard-type-section-size)] leading-[var(--dashboard-type-section-line-height)] text-foreground",
        className
      )}
      {...props}
    />
  )
}

function DashboardSubsectionHeading({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-dashboard-typography-role="subsection"
      className={cn(
        "font-heading font-medium text-[length:var(--dashboard-type-subsection-size)] leading-[var(--dashboard-type-subsection-line-height)] text-foreground",
        className
      )}
      {...props}
    />
  )
}

function DashboardLeadText({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-dashboard-typography-role="lead"
      className={cn(
        "text-[length:var(--dashboard-type-lead-size)] leading-[var(--dashboard-type-lead-line-height)] text-foreground/90",
        className
      )}
      {...props}
    />
  )
}

function DashboardBodyText({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-dashboard-typography-role="body"
      className={cn(
        "text-[length:var(--dashboard-type-body-size)] leading-[var(--dashboard-type-body-line-height)] text-foreground",
        className
      )}
      {...props}
    />
  )
}

function DashboardSupportingText({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-dashboard-typography-role="supporting"
      className={cn(
        "text-[length:var(--dashboard-type-supporting-size)] leading-[var(--dashboard-type-supporting-line-height)] text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function DashboardCaptionText({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-dashboard-typography-role="caption"
      className={cn(
        "text-[length:var(--dashboard-type-caption-size)] leading-[var(--dashboard-type-caption-line-height)] text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function DashboardOverlineText({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-dashboard-typography-role="overline"
      className={cn(
        "text-[length:var(--dashboard-type-overline-size)] leading-[var(--dashboard-type-overline-line-height)] font-medium tracking-[var(--dashboard-type-overline-tracking)] text-muted-foreground uppercase",
        className
      )}
      {...props}
    />
  )
}

function DashboardQuoteText({
  className,
  ...props
}: React.ComponentProps<"blockquote">) {
  return (
    <blockquote
      data-dashboard-typography-role="quote"
      className={cn(
        "border-border text-[length:var(--dashboard-type-body-size)] leading-[var(--dashboard-type-body-line-height)] border-l-2 pl-4 text-muted-foreground italic",
        className
      )}
      {...props}
    />
  )
}

function DashboardInlineCode({
  className,
  ...props
}: React.ComponentProps<"code">) {
  return (
    <code
      data-dashboard-typography-role="inline-code"
      className={cn(
        "rounded bg-muted px-1.5 py-0.5 font-mono text-[length:var(--dashboard-type-code-size)] leading-[var(--dashboard-type-code-line-height)] text-foreground",
        className
      )}
      {...props}
    />
  )
}

type DashboardTextLinkProps = Omit<
  React.ComponentProps<typeof Link>,
  "className"
> & { className?: string }

function DashboardTextLink({ className, ...props }: DashboardTextLinkProps) {
  return (
    <Link
      data-dashboard-typography-role="link"
      className={cn(
        "text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline",
        className
      )}
      {...props}
    />
  )
}

export {
  DashboardDisplayHeading,
  DashboardPageTitle,
  DashboardSectionHeading,
  DashboardSubsectionHeading,
  DashboardLeadText,
  DashboardBodyText,
  DashboardSupportingText,
  DashboardCaptionText,
  DashboardOverlineText,
  DashboardQuoteText,
  DashboardInlineCode,
  DashboardTextLink,
}
