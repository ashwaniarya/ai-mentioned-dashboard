import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { MentionFilters, TrendPoint } from "@/models";
import { brandMentionsApiService } from "@/services";
import { mentionFiltersForApiRequestBody } from "@/lib/helpers/mention-filters";

export type TrendChartViewState =
  | { status: "loading"; points: TrendPoint[] }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "ready"; points: TrendPoint[] };

export interface TrendChartDataResult {
  viewState: TrendChartViewState;
}

function trendChartViewStateFromQuery(query: {
  isLoading: boolean;
  error: Error | undefined;
  data: { data: TrendPoint[] } | undefined;
}): TrendChartViewState {
  const points = query.data?.data ?? [];

  if (query.isLoading) {
    return { status: "loading", points };
  }
  if (query.error) {
    return { status: "error", message: query.error.message };
  }
  if (points.length === 0) {
    return { status: "empty" };
  }
  return { status: "ready", points };
}

export function useTrendChartData(
  filtersForApi: MentionFilters,
  groupBy: "day" | "week"
): TrendChartDataResult {
  const requestFilters = useMemo(
    () => mentionFiltersForApiRequestBody(filtersForApi),
    [filtersForApi]
  );

  const trendsQuery = brandMentionsApiService.useTrends({
    group_by: groupBy,
    filters: requestFilters,
  });

  const viewState = useMemo(
    () =>
      trendChartViewStateFromQuery({
        isLoading: trendsQuery.isLoading,
        error: trendsQuery.error,
        data: trendsQuery.data,
      }),
    [trendsQuery.isLoading, trendsQuery.error, trendsQuery.data]
  );

  useEffect(() => {
    if (trendsQuery.error) toast.error(trendsQuery.error.message);
  }, [trendsQuery.error]);

  return { viewState };
}
