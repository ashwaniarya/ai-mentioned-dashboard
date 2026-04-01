import useSWR from "swr";
import { API_BASE_URL, SWR_DEDUPING_INTERVAL_MS } from "@/config";
import type {
  MentionsRequest,
  MentionsResponse,
  TrendsRequest,
  TrendsResponse,
  ErrorResponse,
} from "@/models";

async function postJson<TResponse>(
  url: string,
  body: unknown
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody: ErrorResponse = await response.json().catch(() => ({
      error: "Request failed",
      detail: `HTTP ${response.status}`,
    }));
    throw new Error(errorBody.detail ?? errorBody.error);
  }

  return response.json();
}

async function fetchMentions(
  request: MentionsRequest
): Promise<MentionsResponse> {
  return postJson<MentionsResponse>(`${API_BASE_URL}/mentions`, request);
}

async function fetchTrends(request: TrendsRequest): Promise<TrendsResponse> {
  return postJson<TrendsResponse>(
    `${API_BASE_URL}/mentions/trends`,
    request
  );
}

function useMentions(request: MentionsRequest) {
  const stableKey = JSON.stringify(request);

  return useSWR<MentionsResponse, Error>(
    [`${API_BASE_URL}/mentions`, stableKey],
    () => fetchMentions(request),
    { revalidateOnFocus: false, dedupingInterval: SWR_DEDUPING_INTERVAL_MS }
  );
}

function useTrends(request: TrendsRequest) {
  const stableKey = JSON.stringify(request);

  return useSWR<TrendsResponse, Error>(
    [`${API_BASE_URL}/mentions/trends`, stableKey],
    () => fetchTrends(request),
    { revalidateOnFocus: false, dedupingInterval: SWR_DEDUPING_INTERVAL_MS }
  );
}

export const brandMentionsApiService = {
  fetchMentions,
  fetchTrends,
  useMentions,
  useTrends,
} as const;
