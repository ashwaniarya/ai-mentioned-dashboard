import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MentionModelChip } from "@/components/mention-table/mention-model-chip"

describe("MentionModelChip", () => {
  it("maps chatgpt to chatgpt brand", () => {
    render(<MentionModelChip model="chatgpt" />)
    const el = screen.getByText("ChatGPT")
    expect(el).toHaveAttribute("data-mention-model", "chatgpt")
    expect(el).toHaveAttribute("data-model-brand", "chatgpt")
  })

  it("maps gemini to gemini brand", () => {
    render(<MentionModelChip model="gemini" />)
    expect(screen.getByText("Gemini")).toHaveAttribute(
      "data-model-brand",
      "gemini"
    )
  })

  it("uses unknown for unrecognized models", () => {
    render(<MentionModelChip model="unknown_vendor" />)
    const el = screen.getByText("Unknown Vendor")
    expect(el).toHaveAttribute("data-mention-model", "unknown_vendor")
    expect(el).toHaveAttribute("data-model-brand", "unknown")
  })

  it("normalizes model id case", () => {
    render(<MentionModelChip model="CLAUDE" />)
    expect(screen.getByText("Claude")).toHaveAttribute(
      "data-model-brand",
      "claude"
    )
  })
})
