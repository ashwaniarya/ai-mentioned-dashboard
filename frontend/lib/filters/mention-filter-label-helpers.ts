import {
  type FilterChoice,
  mentionFilterChoices,
} from "@/config/mention-filter-labels";

function humanizeUnknownValue(raw: string): string {
  const normalized = raw.trim();
  if (!normalized) return normalized;
  const words = normalized
    .split(/[_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return words.length > 0 ? words.join(" ") : normalized;
}

export function labelForValue(
  choices: readonly FilterChoice[],
  raw: unknown
): string {
  if (raw == null || raw === "") return "";
  if (typeof raw !== "string") return String(raw);
  const matchingChoice = choices.find((choice) => choice.value === raw);
  return matchingChoice?.label ?? humanizeUnknownValue(raw);
}

export function displayLabelForMentionModel(model: string): string {
  if (!model) return model;
  return labelForValue(mentionFilterChoices.model, model);
}

export function displayLabelForMentionSentiment(sentiment: string): string {
  if (!sentiment) return sentiment;
  return labelForValue(mentionFilterChoices.sentiment, sentiment);
}
