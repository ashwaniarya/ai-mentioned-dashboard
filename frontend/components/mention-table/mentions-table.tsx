"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MENTION_FILTER_DEBOUNCE_INTERVAL_MS } from "@/config";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { buildMentionFiltersForApi } from "@/lib/helpers/mention-filter-api";
import { normalizeDashboardMentionFiltersAfterParse, mentionFiltersShallowEqualForDashboard } from "@/lib/helpers/mention-filter-default-date-range";
import { parseMentionFiltersFromSearchParams, mentionFiltersToSortedQueryString, writeMentionFiltersToSearchParams } from "@/lib/helpers/mention-filters-url";
import { MentionsTableFilter } from "@/components/mention-table/mentions-table-filter";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Chip } from "@/components/ui/chip";
import { MentionModelChip } from "@/components/mention-table/mention-model-chip";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DashboardBodyText,
  DashboardSupportingText,
} from "@/components/ui/typography";
import { ChevronLeft, ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import { chipToneForMentionSentimentValue } from "@/lib/helpers/mention-table-chip-tones";
import type { Mention, MentionFilters } from "@/models";
import {
  useMentionsTableData,
  type MentionsTableViewState,
} from "@/hooks/use-mentions-table-data";
import { displayLabelForMentionSentiment } from "@/lib/helpers/mention-filter-label-helpers";
import { cn } from "@/lib/utils";

// ── Column definitions (module-level, no per-render cost) ─────────────

const columnHelper = createColumnHelper<Mention>();

const RESPONSIVE_COLUMN_CLASS_BY_ID: Record<string, string | undefined> = {
  position: "hidden md:table-cell",
  sentiment: "hidden sm:table-cell",
  citation_url: "hidden md:table-cell",
  created_at: "hidden sm:table-cell",
};

const PAGINATION_BUTTON_CLASS = "size-11 sm:size-8";

const mentionColumns = [
  columnHelper.accessor("query_text", {
    header: "Query",
    cell: (info) => (
      <span
        className="block max-w-[140px] truncate font-medium text-foreground sm:max-w-[220px]"
        title={info.getValue()}
      >
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("model", {
    header: "Model",
    cell: (info) => <MentionModelChip model={info.getValue()} />,
  }),
  columnHelper.accessor("mentioned", {
    header: "Mentioned",
    cell: (info) => {
      const mentioned = info.getValue();
      return (
        <Chip
          variant={mentioned ? "subtle" : "outline"}
          tone={mentioned ? "success" : "neutral"}
          className={
            mentioned
              ? "!border-mention-yes-chip-border !bg-mention-yes-chip-bg !text-success"
              : undefined
          }
        >
          {mentioned ? "Yes" : "No"}
        </Chip>
      );
    },
  }),
  columnHelper.accessor("position", {
    header: "Position",
    cell: (info) => {
      const val = info.getValue();
      return val !== null ? (
        <span className="font-mono tabular-nums text-muted-foreground">
          #{val}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  }),
  columnHelper.accessor("sentiment", {
    header: "Sentiment",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "—";
      const tone = chipToneForMentionSentimentValue(val);
      return (
        <Chip variant="subtle" tone={tone}>
          {displayLabelForMentionSentiment(val)}
        </Chip>
      );
    },
  }),
  columnHelper.accessor("citation_url", {
    header: "Citation",
    cell: (info) => {
      const url = info.getValue();
      if (!url) return "—";
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-info underline-offset-2 hover:text-info/80 hover:underline"
        >
          <ExternalLink className="size-4" />
          Link
        </a>
      );
    },
  }),
  columnHelper.accessor("created_at", {
    header: "Date",
    cell: (info) => (
      <span className="text-muted-foreground tabular-nums">
        {new Date(info.getValue()).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  }),
];

// ── Co-located sub-components ─────────────────────────────────────────

function MentionsTableSkeleton({
  tableHeader,
  columnCount,
  rowCount,
}: {
  tableHeader: React.ReactNode;
  columnCount: number;
  rowCount: number;
}) {
  return (
    <>
      <CardContent className="p-0">
        <Table>
          {tableHeader}
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-4 w-3/4" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <div className="flex flex-col gap-3 border-t border-border/70 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-28" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-1">
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="size-9 rounded-md" />
          </div>
        </div>
      </div>
    </>
  );
}

function RefetchingOverlay() {
  return (
    <div
      data-testid="mentions-table-loading-overlay"
      className="absolute inset-0 z-10 bg-background/45 backdrop-blur-sm"
    >
      <div className="flex h-full items-center justify-center p-4">
        <Loader2
          data-testid="mentions-table-loading-spinner"
          aria-label="Loading page data"
          className="size-8 animate-spin text-foreground/80"
        />
      </div>
    </div>
  );
}

function MentionsTablePagination({
  page,
  perPage,
  totalPages,
  totalResults,
  isRefetching,
  onPageChange,
  onPerPageChange,
}: {
  page: number;
  perPage: number;
  totalPages: number;
  totalResults: number;
  isRefetching: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-border/70 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <DashboardSupportingText>
        {totalResults.toLocaleString()} total results
      </DashboardSupportingText>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-1.5">
          <DashboardSupportingText className="m-0 shrink-0">
            Rows
          </DashboardSupportingText>
          <Select
            value={String(perPage)}
            onValueChange={(val) => onPerPageChange(Number(val))}
            disabled={isRefetching}
          >
            <SelectTrigger className="min-h-11 w-20 sm:min-h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <DashboardSupportingText className="m-0 shrink-0">
            Page {page} of {totalPages}
          </DashboardSupportingText>
          <div className="flex gap-2 sm:gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isRefetching}
              className={PAGINATION_BUTTON_CLASS}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isRefetching}
              className={PAGINATION_BUTTON_CLASS}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────


export function MentionsTable() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const lastReplacedSortedQueryRef = useRef<string | null>(null);

  const [filters, setFilters] = useState<MentionFilters>(() => {
    const params = new URLSearchParams(searchParams.toString());
    const parsed = parseMentionFiltersFromSearchParams(params, "table_");
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
      parseMentionFiltersFromSearchParams(params, "table_"),
      new Date()
    );
    setFilters((previous) =>
      mentionFiltersShallowEqualForDashboard(previous, fromUrl) ? previous : fromUrl
    );
  }, [searchParamsSnapshot]);

  useEffect(() => {
    const nextSorted = mentionFiltersToSortedQueryString(filters, "table_");
    if (nextSorted === lastReplacedSortedQueryRef.current) return;
    lastReplacedSortedQueryRef.current = nextSorted;

    const currentParams = new URLSearchParams(searchParams.toString());
    const newParams = writeMentionFiltersToSearchParams(currentParams, filters, "table_");
    
    const query = newParams.toString() ? `?${newParams.toString()}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  }, [filters, pathname, router, searchParams]);

  const { viewState, page, perPage, totalPages, goToPage, changePerPage } =
    useMentionsTableData(filtersForApi);

  const rows = viewState.status === "ready" ? viewState.rows : [];

  const table = useReactTable({
    data: rows,
    columns: mentionColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: { pagination: { pageIndex: page - 1, pageSize: perPage } },
  });

  const tableHeader = (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow
          key={headerGroup.id}
          className="border-b border-border/70 bg-muted/35 hover:bg-muted/35"
        >
          {headerGroup.headers.map((header) => (
            <TableHead
              key={header.id}
              className={cn(
                RESPONSIVE_COLUMN_CLASS_BY_ID[header.column.id],
                "text-muted-foreground"
              )}
            >
              {flexRender(
                header.column.columnDef.header,
                header.getContext()
              )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );

  return (
    <Card className="overflow-hidden border-border/80 shadow-dashboard-subtle">
      <CardContent className="p-4 sm:p-6 space-y-6">
        <MentionsTableFilter filters={filters} onFiltersChange={handleFiltersChange} />
        {renderBody(viewState)}
      </CardContent>
    </Card>
  );

  function renderBody(state: MentionsTableViewState) {
    switch (state.status) {
      case "loading":
        return (
          <div className="pt-2">
            <MentionsTableSkeleton
              tableHeader={tableHeader}
              columnCount={mentionColumns.length}
              rowCount={perPage}
            />
          </div>
        );

      case "empty":
        return (
          <CardContent className="flex flex-col items-center justify-center bg-muted/20 py-14">
            <DashboardSupportingText>
              No mentions match your filters.
            </DashboardSupportingText>
          </CardContent>
        );

      case "error":
        return (
          <div className="flex flex-col items-center justify-center rounded-lg bg-muted/20 py-14">
            <DashboardBodyText className="font-medium">
              Unable to load brand mentions.
            </DashboardBodyText>
            <DashboardSupportingText className="mt-1 block">
              Please try again in a moment.
            </DashboardSupportingText>
          </div>
        );

      case "ready":
        return (
          <>
            <div className="relative rounded-lg border border-border/70 overflow-hidden">
              <div className="p-0">
                <Table>
                  {tableHeader}
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={
                              RESPONSIVE_COLUMN_CLASS_BY_ID[cell.column.id]
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {state.isRefetching && <RefetchingOverlay />}
            </div>

            <MentionsTablePagination
              page={page}
              perPage={perPage}
              totalPages={totalPages}
              totalResults={state.total}
              isRefetching={state.isRefetching}
              onPageChange={goToPage}
              onPerPageChange={changePerPage}
            />
          </>
        );
    }
  }
}

