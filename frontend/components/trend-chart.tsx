"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingFade } from "@/components/ui/loading-fade";
import { Skeleton } from "@/components/ui/skeleton";
import type { MentionFilters, TrendPoint } from "@/models";
import { brandMentionsApiService } from "@/services";
import { TRENDS_DEFAULT_GROUP_BY } from "@/config";
import { mentionFiltersForApiRequestBody } from "@/lib/validation";

interface TrendChartProps {
  filtersForApi: MentionFilters;
}

function TrendChartPresentation({
  data,
  isLoading,
}: {
  data: TrendPoint[];
  isLoading: boolean;
}) {
  const loadingContent = (
    <Skeleton className="h-[280px] w-full rounded-lg" />
  );

  const loadedContent =
    data.length === 0 ? (
      <div className="flex h-[280px] flex-col items-center justify-center rounded-lg bg-muted/20 py-14">
        <p className="text-sm text-muted-foreground">
          No trend data available
        </p>
      </div>
    ) : (
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientMentioned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                fontSize: "0.875rem",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              name="Total Queries"
              stroke="var(--color-chart-2)"
              fill="url(#gradientTotal)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="mentioned"
              name="Mentioned"
              stroke="var(--color-chart-1)"
              fill="url(#gradientMentioned)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>Mention Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <LoadingFade isLoading={isLoading} loadingContent={loadingContent}>
          {loadedContent}
        </LoadingFade>
      </CardContent>
    </Card>
  );
}

export function TrendChart({ filtersForApi }: TrendChartProps) {
  const trendsQuery = brandMentionsApiService.useTrends({
    group_by: TRENDS_DEFAULT_GROUP_BY,
    filters: mentionFiltersForApiRequestBody(filtersForApi),
  });

  useEffect(() => {
    if (trendsQuery.error) toast.error(trendsQuery.error.message);
  }, [trendsQuery.error]);

  return (
    <TrendChartPresentation
      data={trendsQuery.data?.data ?? []}
      isLoading={trendsQuery.isLoading}
    />
  );
}
