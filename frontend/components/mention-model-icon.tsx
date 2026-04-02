/**
 * Brand glyphs for dashboard model labels. SVG paths for Gemini, Perplexity, and Claude
 * come from Simple Icons (CC0, https://github.com/simple-icons/simple-icons).
 * Logos are trademarks of their owners; use is informational only.
 *
 * OpenAI / ChatGPT is not shipped in the Simple Icons npm set at this version; we use
 * Lucide Sparkles as a neutral “generative assistant” cue instead of an unofficial mark.
 */
import { siClaude, siGooglegemini, siPerplexity } from "simple-icons"
import { Bot, Sparkles } from "lucide-react"

import type { MentionModelBrand } from "@/lib/mention-model-brand"
import { cn } from "@/lib/utils"

function SimpleIconGlyph({
  path,
  className,
}: {
  path: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-3.5 shrink-0", className)}
    >
      <path fill="currentColor" d={path} />
    </svg>
  )
}

type MentionModelIconProps = {
  brand: MentionModelBrand
  className?: string
}

function MentionModelIcon({ brand, className }: MentionModelIconProps) {
  const iconClass = cn("shrink-0", className)

  switch (brand) {
    case "chatgpt":
      return (
        <Sparkles
          aria-hidden
          className={cn("size-3.5", iconClass)}
          strokeWidth={2}
        />
      )
    case "gemini":
      return (
        <SimpleIconGlyph path={siGooglegemini.path} className={iconClass} />
      )
    case "perplexity":
      return (
        <SimpleIconGlyph path={siPerplexity.path} className={iconClass} />
      )
    case "claude":
      return <SimpleIconGlyph path={siClaude.path} className={iconClass} />
    default:
      return <Bot aria-hidden className={cn("size-3.5", iconClass)} />
  }
}

export { MentionModelIcon }
