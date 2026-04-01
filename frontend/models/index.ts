/** Client-only; omitted from API request bodies. */
export type MentionDateRangePreset =
  | "maximum"
  | "last_3_days"
  | "last_7_days"
  | "last_30_days"
  | "custom";

export interface MentionFilters {
  model?: "chatgpt" | "claude" | "gemini" | "perplexity";
  sentiment?: "positive" | "neutral" | "negative";
  mentioned?: boolean;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  /** Dashboard / URL only; never sent to the backend. */
  mention_date_range_preset?: MentionDateRangePreset;
}

export interface MentionsRequest {
  page: number;
  per_page: number;
  filters?: MentionFilters;
}

export interface Mention {
  id: string;
  query_text: string;
  model: string;
  mentioned: boolean;
  position: number | null;
  sentiment: string | null;
  citation_url: string | null;
  created_at: string;
}

export interface MentionsResponse {
  data: Mention[];
  total: number;
  page: number;
  per_page: number;
}

export interface TrendsRequest {
  date_from?: string;
  date_to?: string;
  group_by: "day" | "week";
}

export interface TrendPoint {
  date: string;
  total: number;
  mentioned: number;
}

export interface TrendsResponse {
  data: TrendPoint[];
}

export interface ErrorResponse {
  error: string;
  detail?: string;
}
