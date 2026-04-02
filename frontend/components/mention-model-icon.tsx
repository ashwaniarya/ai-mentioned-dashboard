/**
 * Brand glyphs for dashboard model labels. SVG paths for Gemini, Perplexity, and Claude
 * come from Simple Icons (CC0, https://github.com/simple-icons/simple-icons).
 * OpenAI’s Blossom symbol is vendored from the same geometry as Wikimedia’s 2025 symbol file
 * (see `lib/brand-icons/openai-official-blossom-symbol.ts`). Logos are trademarks of their owners;
 * use is informational only.
 */
import { siClaude, siGooglegemini, siPerplexity } from "simple-icons"
import { Bot } from "lucide-react"

import {
  openAiOfficialBlossomSymbolSvgPath,
  openAiOfficialBlossomSymbolSvgViewBox,
} from "@/lib/brand-icons/openai-official-blossom-symbol"
import type { MentionModelBrand } from "@/lib/mention-model-brand"
import { cn } from "@/lib/utils"

function SimpleIconGlyph({
  path,
  viewBox = "0 0 24 24",
  className,
}: {
  path: string
  viewBox?: string
  className?: string
}) {
  return (
    <svg
      viewBox={viewBox}
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
        <SimpleIconGlyph
          path={openAiOfficialBlossomSymbolSvgPath}
          viewBox={openAiOfficialBlossomSymbolSvgViewBox}
          className={iconClass}
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
