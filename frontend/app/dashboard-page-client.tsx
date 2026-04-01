"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { MentionFilterControl } from "@/components/mention-filter/mention-filter-control";
import { MentionsTable } from "@/components/mentions-table";
import { TrendChart } from "@/components/trend-chart";
import type { MentionFilters } from "@/models";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { buildMentionFiltersForApi } from "@/lib/helpers/mention-filter-api";
import {
  getDashboardBaselineMentionFilters,
  mentionFiltersShallowEqualForDashboard,
  normalizeDashboardMentionFiltersAfterParse,
} from "@/lib/helpers/mention-filter-default-date-range";
import {
  mentionFiltersToSortedQueryString,
  parseMentionFiltersFromSearchParams,
  sortedUrlSearchParamsString,
} from "@/lib/helpers/mention-filters-url";
import { MENTION_FILTER_DEBOUNCE_INTERVAL_MS } from "@/config";

export function DashboardPageClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const lastReplacedSortedQueryRef = useRef<string | null>(null);

  const [filters, setFilters] = useState<MentionFilters>(() =>
    normalizeDashboardMentionFiltersAfterParse(
      parseMentionFiltersFromSearchParams(
        new URLSearchParams(searchParams.toString())
      ),
      new Date()
    )
  );

  const debouncedFilters = useDebouncedValue(
    filters,
    MENTION_FILTER_DEBOUNCE_INTERVAL_MS
  );

  const filtersForApi = useMemo(
    () => buildMentionFiltersForApi(debouncedFilters),
    [debouncedFilters]
  );

  const searchParamsSnapshot = searchParams.toString();

  useLayoutEffect(() => {
    const currentSorted = sortedUrlSearchParamsString(
      new URLSearchParams(searchParamsSnapshot)
    );
    if (lastReplacedSortedQueryRef.current === currentSorted) {
      lastReplacedSortedQueryRef.current = null;
      return;
    }
    const fromUrl = normalizeDashboardMentionFiltersAfterParse(
      parseMentionFiltersFromSearchParams(
        new URLSearchParams(searchParamsSnapshot)
      ),
      new Date()
    );
    setFilters((previous) =>
      mentionFiltersShallowEqualForDashboard(previous, fromUrl)
        ? previous
        : fromUrl
    );
  }, [searchParamsSnapshot]);

  useEffect(() => {
    const nextSorted = mentionFiltersToSortedQueryString(filters);
    const currentSorted = sortedUrlSearchParamsString(
      new URLSearchParams(searchParams.toString())
    );
    if (nextSorted === currentSorted) return;
    lastReplacedSortedQueryRef.current = nextSorted;
    const query = nextSorted.length > 0 ? `?${nextSorted}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  }, [filters, pathname, router, searchParams]);

  const handleFiltersChange = useCallback((newFilters: MentionFilters) => {
    setFilters(
      normalizeDashboardMentionFiltersAfterParse(newFilters, new Date())
    );
  }, []);

  const dashboardBaselineMentionFilters = getDashboardBaselineMentionFilters();

  return (
    <>
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DashboardHeader />
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 sm:pb-4 lg:px-8">
          <MentionFilterControl
            filters={filters}
            onFiltersChange={handleFiltersChange}
            dashboardBaselineMentionFilters={dashboardBaselineMentionFilters}
          />
        </div>
      </div>
      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <TrendChart filtersForApi={filtersForApi} />

        <MentionsTable filtersForApi={filtersForApi} />
      </main>
    </>
  );
}
