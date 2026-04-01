"use client";

import { useMemo, useState, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { MentionFilterControl } from "@/components/mention-filter-control";
import { MentionsTable } from "@/components/mentions-table";
import { TrendChart } from "@/components/trend-chart";
import type { MentionFilters } from "@/models";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { buildMentionFiltersForApi } from "@/lib/validation";
import { MENTION_FILTER_DEBOUNCE_INTERVAL_MS } from "@/config";

export default function Dashboard() {
  const [filters, setFilters] = useState<MentionFilters>({});

  const debouncedFilters = useDebouncedValue(
    filters,
    MENTION_FILTER_DEBOUNCE_INTERVAL_MS
  );

  const filtersForApi = useMemo(
    () => buildMentionFiltersForApi(debouncedFilters),
    [debouncedFilters]
  );

  const handleFiltersChange = useCallback((newFilters: MentionFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <>
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DashboardHeader />
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <MentionFilterControl
            filters={filters}
            onFiltersChange={handleFiltersChange}
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
