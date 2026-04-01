import { describe, it, expect, vi, beforeEach } from "vitest";

const API_BASE_URL = "http://localhost:8000";

async function postFetcher<TResponse>(
  url: string,
  body: unknown
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      error: "Request failed",
      detail: `HTTP ${response.status}`,
    }));
    throw new Error(errorBody.detail ?? errorBody.error);
  }

  return response.json();
}

describe("postFetcher", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("F1 — returns parsed JSON on success", async () => {
    const mockPayload = { data: [{ id: "1" }], total: 1 };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPayload),
      })
    );

    const result = await postFetcher(`${API_BASE_URL}/mentions`, { page: 1 });
    expect(result).toEqual(mockPayload);
  });

  it("F2 — throws with ErrorResponse detail on 422", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: () =>
          Promise.resolve({
            error: "Validation Error",
            detail: "model must be one of chatgpt, claude, gemini, perplexity",
          }),
      })
    );

    await expect(
      postFetcher(`${API_BASE_URL}/mentions`, { filters: { model: "bad" } })
    ).rejects.toThrow(
      "model must be one of chatgpt, claude, gemini, perplexity"
    );
  });

  it("F3 — throws meaningful error on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))
    );

    await expect(
      postFetcher(`${API_BASE_URL}/mentions`, {})
    ).rejects.toThrow("Failed to fetch");
  });
});
