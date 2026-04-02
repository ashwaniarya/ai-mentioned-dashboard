/**
 * Maps stored option values to user-facing labels for selects, chips, and summaries.
 * Not tied to mentions — any `{ value, label }` list works.
 */
export interface ChoiceValueWithDisplayLabel {
  readonly value: string;
  readonly label: string;
}

/** Title-cases tokens split on `_` or `-` (fallback when no choice matches). */
export function humanizeUnknownStringForDisplay(raw: string): string {
  const normalized = raw.trim();
  if (!normalized) return normalized;
  const words = normalized
    .split(/[_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return words.length > 0 ? words.join(" ") : normalized;
}

/**
 * Resolves `raw` to the matching choice `label`, or a humanized string fallback.
 */
export function labelForValue(
  choices: readonly ChoiceValueWithDisplayLabel[],
  raw: unknown
): string {
  if (raw == null || raw === "") return "";
  if (typeof raw !== "string") return String(raw);
  const matchingChoice = choices.find((choice) => choice.value === raw);
  return matchingChoice?.label ?? humanizeUnknownStringForDisplay(raw);
}
