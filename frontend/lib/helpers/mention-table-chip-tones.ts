import type { ChipTone } from "@/components/ui/chip"

/** Maps API sentiment strings to semantic chip tones (mentions table). */
export function chipToneForMentionSentimentValue(sentiment: string): ChipTone {
  switch (sentiment) {
    case "positive":
      return "success"
    case "neutral":
      return "info"
    case "negative":
      return "destructive"
    default:
      return "neutral"
  }
}
