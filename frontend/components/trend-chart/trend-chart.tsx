"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MENTION_FILTER_DEBOUNCE_INTERVAL_MS } from "@/config";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  buildMentionFiltersForApi,
  mentionFiltersShallowEqualForDashboard,
  mentionFiltersToSortedQueryString,
  normalizeDashboardMentionFiltersAfterParse,
  parseMentionFiltersFromSearchParams,
  writeMentionFiltersToSearchParams,
} from "@/lib/helpers/mention-filters";
import { TrendChartFilter } from "@/components/trend-chart/trend-chart-filter";

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
} from "@/components/ui/card";
import {
  DashboardBodyText,
  DashboardSupportingText,
} from "@/components/ui/typography";
import { LoadingFade } from "@/components/ui/loading-fade";
import { Skeleton } from "@/components/ui/skeleton";
import type { MentionFilters, TrendPoint } from "@/models";
import { useCompactTrendChartLayout } from "@/hooks/use-compact-trend-chart-layout";
import {
  useTrendChartData,
  type TrendChartViewState,
} from "@/hooks/use-trend-chart-data";

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

  const legendLabelClassName =
    "text-[length:var(--dashboard-type-caption-size)] leading-[var(--dashboard-type-caption-line-height)] text-muted-foreground sm:text-[length:var(--dashboard-type-supporting-size)] sm:leading-[var(--dashboard-type-supporting-line-height)]";

  return (
    <div className="mt-dashboard-md flex flex-wrap items-center justify-center gap-x-dashboard-lg gap-y-dashboard-sm">
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-full bg-[var(--color-chart-2)]"
        />
        <span className={legendLabelClassName}>{totalSeriesLabel}</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-full bg-[var(--color-chart-1)]"
        />
        <span className={legendLabelClassName}>{MENTIONED_SERIES_LABEL}</span>
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
            <DashboardSupportingText>
              No trend data available
            </DashboardSupportingText>
          </div>
        );
      case "error":
        return (
          <div
            className="flex flex-col items-center justify-center rounded-lg bg-muted/20 py-14"
            style={{ height: TREND_CHART_HEIGHT_PX }}
          >
            <DashboardBodyText className="font-medium">
              Unable to load mention trends.
            </DashboardBodyText>
            <DashboardSupportingText className="mt-1 block">
              Please try again in a moment.
            </DashboardSupportingText>
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
    <LoadingFade
      isLoading={viewState.status === "loading"}
      loadingContent={loadingContent}
    >
      {renderMainContent()}
    </LoadingFade>
  );
}



export function TrendChart() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const lastReplacedSortedQueryRef = useRef<string | null>(null);

  const [filters, setFilters] = useState<MentionFilters>(() => {
    const params = new URLSearchParams(searchParams.toString());
    const parsed = parseMentionFiltersFromSearchParams(params, "chart_");
    return normalizeDashboardMentionFiltersAfterParse(
      parsed,
      new Date()
    );
  });

  const debouncedFilters = useDebouncedValue(
    filters,
    MENTION_FILTER_DEBOUNCE_INTERVAL_MS
  );

  const filtersForApi = useMemo(
    () => buildMentionFiltersForApi(debouncedFilters),
    [debouncedFilters]
  );

  const handleFiltersChange = useCallback((newFilters: MentionFilters) => {
    setFilters(normalizeDashboardMentionFiltersAfterParse(newFilters, new Date()));
  }, []);

  const searchParamsSnapshot = searchParams.toString();
  useEffect(() => {
    const params = new URLSearchParams(searchParamsSnapshot);
    const fromUrl = normalizeDashboardMentionFiltersAfterParse(
      parseMentionFiltersFromSearchParams(params, "chart_"),
      new Date()
    );
    setFilters((previous) =>
      mentionFiltersShallowEqualForDashboard(previous, fromUrl) ? previous : fromUrl
    );
  }, [searchParamsSnapshot]);

  useEffect(() => {
    const nextSorted = mentionFiltersToSortedQueryString(filters, "chart_");
    if (nextSorted === lastReplacedSortedQueryRef.current) return;
    lastReplacedSortedQueryRef.current = nextSorted;

    const currentParams = new URLSearchParams(searchParams.toString());
    const newParams = writeMentionFiltersToSearchParams(currentParams, filters, "chart_");
    
    const query = newParams.toString() ? `?${newParams.toString()}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  }, [filters, pathname, router, searchParams]);

  const { viewState } = useTrendChartData(filtersForApi, debouncedFilters.group_by || "day");
  const isCompactTrendChartLayout = useCompactTrendChartLayout();

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardContent className="p-4 sm:p-6 space-y-6">
        <TrendChartFilter filters={filters} onFiltersChange={handleFiltersChange} />
        <TrendChartPresentation
          viewState={viewState}
          isCompactTrendChartLayout={isCompactTrendChartLayout}
        />
      </CardContent>
    </Card>
  );
}
