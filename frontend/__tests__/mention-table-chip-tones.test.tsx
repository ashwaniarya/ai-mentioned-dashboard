import { describe, expect, it } from "vitest"

import { chipToneForMentionSentimentValue } from "@/lib/helpers/mention-table-chip-tones"

describe("chipToneForMentionSentimentValue", () => {
  it("maps positive to success", () => {
    expect(chipToneForMentionSentimentValue("positive")).toBe("success")
  })

  it("maps neutral to info", () => {
    expect(chipToneForMentionSentimentValue("neutral")).toBe("info")
  })

  it("maps negative to destructive", () => {
    expect(chipToneForMentionSentimentValue("negative")).toBe("destructive")
  })

  it("falls back to neutral for unknown values", () => {
    expect(chipToneForMentionSentimentValue("")).toBe("neutral")
    expect(chipToneForMentionSentimentValue("mixed")).toBe("neutral")
  })
})
