import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** Shared shell: hairline neutral border so label (foreground) wins over chrome. */
const chipSubtleBorder =
  "border border-border/15 dark:border-white/[0.12]"

/**
 * Subtle success / info / destructive (e.g. sentiment): semantic text + lighter wash than /12.
 * Wash opacity lives in Tailwind class names so the compiler can see them — tune all three together.
 */
const chipSubtleSuccessSurface = "bg-success/8 text-success"
const chipSubtleInfoSurface = "bg-info/8 text-info"
const chipSubtleDestructiveSurface = "bg-destructive/8 text-destructive"
const chipOutlineBorder =
  "border border-border/25 bg-transparent dark:border-white/[0.14]"

/** Dense, read-only labels (tables, filters). Badges stay pill-shaped for emphasis. */
const chipVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap tabular-nums [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        subtle: "",
        outline: "",
        solid: "",
      },
      tone: {
        neutral: "",
        primary: "",
        success: "",
        warning: "",
        info: "",
        destructive: "",
        chart1: "",
        chart2: "",
        chart3: "",
        chart4: "",
        chart5: "",
      },
    },
    compoundVariants: [
      // subtle — bg wash only; copy uses foreground for contrast vs border
      {
        variant: "subtle",
        tone: "neutral",
        class: cn(
          chipSubtleBorder,
          "bg-muted/70 text-muted-foreground dark:bg-muted/45"
        ),
      },
      {
        variant: "subtle",
        tone: "primary",
        class: cn(chipSubtleBorder, "bg-primary/12 text-foreground"),
      },
      {
        variant: "subtle",
        tone: "success",
        class: cn(chipSubtleBorder, chipSubtleSuccessSurface),
      },
      {
        variant: "subtle",
        tone: "warning",
        class: cn(chipSubtleBorder, "bg-warning/14 text-foreground"),
      },
      {
        variant: "subtle",
        tone: "info",
        class: cn(chipSubtleBorder, chipSubtleInfoSurface),
      },
      {
        variant: "subtle",
        tone: "destructive",
        class: cn(chipSubtleBorder, chipSubtleDestructiveSurface),
      },
      {
        variant: "subtle",
        tone: "chart1",
        class: cn(chipSubtleBorder, "bg-chart-1/12 text-foreground"),
      },
      {
        variant: "subtle",
        tone: "chart2",
        class: cn(chipSubtleBorder, "bg-chart-2/12 text-foreground"),
      },
      {
        variant: "subtle",
        tone: "chart3",
        class: cn(chipSubtleBorder, "bg-chart-3/12 text-foreground"),
      },
      {
        variant: "subtle",
        tone: "chart4",
        class: cn(chipSubtleBorder, "bg-chart-4/12 text-foreground"),
      },
      {
        variant: "subtle",
        tone: "chart5",
        class: cn(chipSubtleBorder, "bg-chart-5/12 text-foreground"),
      },
      // outline — neutral border, no hue-on-hue with text
      {
        variant: "outline",
        tone: "neutral",
        class: cn(chipOutlineBorder, "text-muted-foreground"),
      },
      {
        variant: "outline",
        tone: "primary",
        class: cn(chipOutlineBorder, "text-foreground"),
      },
      {
        variant: "outline",
        tone: "success",
        class: cn(chipOutlineBorder, "text-foreground"),
      },
      {
        variant: "outline",
        tone: "warning",
        class: cn(chipOutlineBorder, "text-foreground"),
      },
      {
        variant: "outline",
        tone: "info",
        class: cn(chipOutlineBorder, "text-foreground"),
      },
      {
        variant: "outline",
        tone: "destructive",
        class: cn(chipOutlineBorder, "text-foreground"),
      },
      {
        variant: "outline",
        tone: "chart1",
        class: cn(chipOutlineBorder, "text-foreground"),
      },
      {
        variant: "outline",
        tone: "chart2",
        class: cn(chipOutlineBorder, "text-foreground"),
      },
      {
        variant: "outline",
        tone: "chart3",
        class: cn(chipOutlineBorder, "text-foreground"),
      },
      {
        variant: "outline",
        tone: "chart4",
        class: cn(chipOutlineBorder, "text-foreground"),
      },
      {
        variant: "outline",
        tone: "chart5",
        class: cn(chipOutlineBorder, "text-foreground"),
      },
      // solid
      {
        variant: "solid",
        tone: "neutral",
        class: "border-transparent bg-muted text-foreground",
      },
      {
        variant: "solid",
        tone: "primary",
        class: "border-transparent bg-primary text-primary-foreground",
      },
      {
        variant: "solid",
        tone: "success",
        class: "border-transparent bg-success text-success-foreground",
      },
      {
        variant: "solid",
        tone: "warning",
        class: "border-transparent bg-warning text-warning-foreground",
      },
      {
        variant: "solid",
        tone: "info",
        class: "border-transparent bg-info text-info-foreground",
      },
      {
        variant: "solid",
        tone: "destructive",
        class: "border-transparent bg-destructive text-destructive-foreground",
      },
      {
        variant: "solid",
        tone: "chart1",
        class:
          "border-transparent bg-chart-1 text-white dark:bg-chart-1 dark:text-white",
      },
      {
        variant: "solid",
        tone: "chart2",
        class:
          "border-transparent bg-chart-2 text-white dark:bg-chart-2 dark:text-white",
      },
      {
        variant: "solid",
        tone: "chart3",
        class:
          "border-transparent bg-chart-3 text-white dark:bg-chart-3 dark:text-white",
      },
      {
        variant: "solid",
        tone: "chart4",
        class:
          "border-transparent bg-chart-4 text-white dark:bg-chart-4 dark:text-white",
      },
      {
        variant: "solid",
        tone: "chart5",
        class:
          "border-transparent bg-chart-5 text-white dark:bg-chart-5 dark:text-white",
      },
    ],
    defaultVariants: {
      variant: "subtle",
      tone: "neutral",
    },
  }
)

type ChipTone = NonNullable<VariantProps<typeof chipVariants>["tone"]>

export type { ChipTone }

function Chip({
  className,
  variant,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof chipVariants>) {
  return (
    <span
      data-slot="chip"
      className={cn(chipVariants({ variant, tone }), className)}
      {...props}
    />
  )
}

export { Chip, chipVariants }
