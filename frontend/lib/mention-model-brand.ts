/** Normalized product id for mention rows and filters (not raw API string). */
export type MentionModelBrand =
  | "chatgpt"
  | "gemini"
  | "perplexity"
  | "claude"
  | "unknown"

const API_VALUE_TO_BRAND: Record<string, MentionModelBrand> = {
  chatgpt: "chatgpt",
  gemini: "gemini",
  perplexity: "perplexity",
  claude: "claude",
}

export function mentionModelBrandFromApiValue(model: string): MentionModelBrand {
  const key = model.trim().toLowerCase()
  return API_VALUE_TO_BRAND[key] ?? "unknown"
}

export const mentionModelBrandByApiValue = API_VALUE_TO_BRAND

/** Tailwind classes for icon `currentColor` (select + chips). */
export const mentionModelIconTintClassByBrand: Record<MentionModelBrand, string> =
  {
    chatgpt: "text-model-chatgpt-fg",
    gemini: "text-model-gemini-fg",
    perplexity: "text-model-perplexity-fg",
    claude: "text-model-claude-fg",
    unknown: "text-muted-foreground",
  }
