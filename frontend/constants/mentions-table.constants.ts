/** Filled chips: semantic tokens only (startup palette — no raw Tailwind palette classes). */
export const mentionsTableSentimentChipClassNameBySentiment: Record<string, string> =
  {
    positive:
      "border-success/35 bg-success/15 text-success dark:border-success/40 dark:bg-success/20 dark:text-success",
    neutral:
      "border-info/30 bg-info/12 text-info dark:border-info/35 dark:bg-info/18 dark:text-info",
    negative:
      "border-destructive/35 bg-destructive/12 text-destructive dark:border-destructive/40 dark:bg-destructive/20 dark:text-destructive",
  };

export const mentionsTableModelNameBadgeClassName =
  "border-primary/30 bg-primary/10 text-primary dark:border-primary/35 dark:bg-primary/15 dark:text-primary";

export const mentionsTableMentionedYesBadgeClassName =
  "border-success/40 bg-success/12 text-success dark:border-success/45 dark:bg-success/18 dark:text-success";

export const mentionsTableMentionedNoBadgeClassName =
  "border-border/80 bg-muted/70 text-muted-foreground dark:bg-muted/50";
