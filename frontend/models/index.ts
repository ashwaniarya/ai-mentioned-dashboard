export interface MentionFilters {
  model?: string;
  sentiment?: string;
  mentioned?: boolean;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  /** Dashboard / URL only; never sent to the backend. */
  mention_date_range_preset?: string;
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
  group_by: string;
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
