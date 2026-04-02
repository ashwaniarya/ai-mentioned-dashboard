import { mentionFilterChoices } from "@/config";
import { labelForValue } from "@/lib/helpers/choice-display-label";

export function displayLabelForMentionModel(model: string): string {
  if (!model) return model;
  const normalizedKey = model.trim().toLowerCase();
  return labelForValue(mentionFilterChoices.model, normalizedKey);
}

export function displayLabelForMentionSentiment(sentiment: string): string {
  if (!sentiment) return sentiment;
  return labelForValue(mentionFilterChoices.sentiment, sentiment);
}
