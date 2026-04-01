/** Filled sentiment chips: readable contrast, subtle border so they don't look like flat stickers. */
export const mentionsTableSentimentChipClassNameBySentiment: Record<string, string> = {
  positive:
    "border border-emerald-500/30 bg-emerald-500/[0.12] text-emerald-900 dark:border-emerald-400/35 dark:bg-emerald-500/15 dark:text-emerald-200",
  neutral:
    "border border-sky-500/30 bg-sky-500/[0.12] text-sky-950 dark:border-sky-400/30 dark:bg-sky-500/15 dark:text-sky-100",
  negative:
    "border border-rose-500/35 bg-rose-500/[0.12] text-rose-900 dark:border-rose-400/35 dark:bg-rose-500/15 dark:text-rose-200",
};

export const mentionsTableModelNameBadgeClassName =
  "border border-violet-500/25 bg-violet-500/[0.1] text-violet-950 dark:border-violet-400/30 dark:bg-violet-500/12 dark:text-violet-100";

export const mentionsTableMentionedYesBadgeClassName =
  "border-emerald-500/40 bg-emerald-500/[0.1] text-emerald-900 dark:border-emerald-500/45 dark:bg-emerald-500/15 dark:text-emerald-200";

export const mentionsTableMentionedNoBadgeClassName =
  "border-border/80 bg-muted/70 text-muted-foreground dark:bg-muted/50";
