"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
import { useCompactTrendChartLayout } from "@/hooks/use-compact-trend-chart-layout";
import {
  useTrendChartData,
  type TrendChartViewState,
} from "@/hooks/use-trend-chart-data";

interface TrendChartProps {
  filtersForApi: MentionFilters;
}

const TREND_CHART_HEIGHT_PX = 280;
const MOBILE_TREND_CHART_Y_AXIS_WIDTH_PX = 32;
const DESKTOP_TREND_CHART_Y_AXIS_WIDTH_PX = 40;
const MOBILE_TOTAL_SERIES_LABEL = "Total";
const TOTAL_SERIES_LABEL = "Total Queries";
const MENTIONED_SERIES_LABEL = "Mentioned";

function formatTrendChartDate(dateValue: string, useCompactLabel: boolean) {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(useCompactLabel ? {} : { year: "numeric" }),
  });
}

function TrendChartLegend({
  useCompactTotalLabel,
}: {
  useCompactTotalLabel: boolean;
}) {
  const totalSeriesLabel = useCompactTotalLabel
    ? MOBILE_TOTAL_SERIES_LABEL
    : TOTAL_SERIES_LABEL;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-2.5 rounded-full bg-[var(--color-chart-2)]"
        />
        <span>{totalSeriesLabel}</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-2.5 rounded-full bg-[var(--color-chart-1)]"
        />
        <span>{MENTIONED_SERIES_LABEL}</span>
      </span>
    </div>
  );
}

function TrendChartBody({
  points,
  isCompactTrendChartLayout,
}: {
  points: TrendPoint[];
  isCompactTrendChartLayout: boolean;
}) {
  return (
    <>
      <div style={{ height: TREND_CHART_HEIGHT_PX }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points}>
            <defs>
              <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-chart-2)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-chart-2)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="gradientMentioned"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-chart-1)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-chart-1)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={isCompactTrendChartLayout ? 28 : 20}
              tickMargin={8}
              tickFormatter={(value) =>
                formatTrendChartDate(value, isCompactTrendChartLayout)
              }
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={
                isCompactTrendChartLayout
                  ? MOBILE_TREND_CHART_Y_AXIS_WIDTH_PX
                  : DESKTOP_TREND_CHART_Y_AXIS_WIDTH_PX
              }
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip
              labelFormatter={(value) =>
                formatTrendChartDate(String(value), false)
              }
              contentStyle={{
                backgroundColor: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                fontSize: "0.875rem",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              name={
                isCompactTrendChartLayout
                  ? MOBILE_TOTAL_SERIES_LABEL
                  : TOTAL_SERIES_LABEL
              }
              stroke="var(--color-chart-2)"
              fill="url(#gradientTotal)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="mentioned"
              name={MENTIONED_SERIES_LABEL}
              stroke="var(--color-chart-1)"
              fill="url(#gradientMentioned)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <TrendChartLegend
        useCompactTotalLabel={isCompactTrendChartLayout}
      />
    </>
  );
}

function TrendChartPresentation({
  viewState,
  isCompactTrendChartLayout,
}: {
  viewState: TrendChartViewState;
  isCompactTrendChartLayout: boolean;
}) {
  const loadingContent = (
    <Skeleton
      className="w-full rounded-lg"
      style={{ height: TREND_CHART_HEIGHT_PX }}
    />
  );

  function renderMainContent() {
    switch (viewState.status) {
      case "empty":
        return (
          <div
            className="flex flex-col items-center justify-center rounded-lg bg-muted/20 py-14"
            style={{ height: TREND_CHART_HEIGHT_PX }}
          >
            <p className="text-sm text-muted-foreground">
              No trend data available
            </p>
          </div>
        );
      case "error":
        return (
          <div
            className="flex flex-col items-center justify-center rounded-lg bg-muted/20 py-14"
            style={{ height: TREND_CHART_HEIGHT_PX }}
          >
            <p className="text-sm font-medium text-foreground">
              Unable to load mention trends.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Please try again in a moment.
            </p>
          </div>
        );
      case "loading":
        return (
          <TrendChartBody
            points={viewState.points}
            isCompactTrendChartLayout={isCompactTrendChartLayout}
          />
        );
      case "ready":
        return (
          <TrendChartBody
            points={viewState.points}
            isCompactTrendChartLayout={isCompactTrendChartLayout}
          />
        );
      default: {
        const exhaustive: never = viewState;
        return exhaustive;
      }
    }
  }

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>Mention Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <LoadingFade
          isLoading={viewState.status === "loading"}
          loadingContent={loadingContent}
        >
          {renderMainContent()}
        </LoadingFade>
      </CardContent>
    </Card>
  );
}

export function TrendChart({ filtersForApi }: TrendChartProps) {
  const { viewState } = useTrendChartData(filtersForApi);
  const isCompactTrendChartLayout = useCompactTrendChartLayout();

  return (
    <TrendChartPresentation
      viewState={viewState}
      isCompactTrendChartLayout={isCompactTrendChartLayout}
    />
  );
}
