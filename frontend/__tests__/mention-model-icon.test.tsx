import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MentionModelIcon } from "@/components/mention-table/mention-model-icon"
import {
  openAiOfficialBlossomSymbolSvgPath,
  openAiOfficialBlossomSymbolSvgViewBox,
} from "@/lib/brand-icons/openai-official-blossom-symbol"

describe("MentionModelIcon", () => {
  it("renders OpenAI Blossom path for chatgpt brand", () => {
    const { container } = render(<MentionModelIcon brand="chatgpt" />)
    const path = container.querySelector("path")
    expect(path).toHaveAttribute("d", openAiOfficialBlossomSymbolSvgPath)
    expect(container.querySelector("svg")).toHaveAttribute(
      "viewBox",
      openAiOfficialBlossomSymbolSvgViewBox
    )
  })

  it("renders Simple Icons path for gemini", async () => {
    const { siGooglegemini } = await import("simple-icons")
    const { container } = render(<MentionModelIcon brand="gemini" />)
    expect(container.querySelector("path")).toHaveAttribute(
      "d",
      siGooglegemini.path
    )
  })
})
