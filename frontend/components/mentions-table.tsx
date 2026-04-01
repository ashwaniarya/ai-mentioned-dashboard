"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import {
  mentionsTableMentionedNoBadgeClassName,
  mentionsTableMentionedYesBadgeClassName,
  mentionsTableModelNameBadgeClassName,
  mentionsTablePageStates,
  mentionsTableSentimentChipClassNameBySentiment,
  type MentionsTablePageState,
} from "@/constants/mentions-table.constants";
import type { Mention, MentionFilters, MentionsResponse } from "@/models";
import { brandMentionsApiService } from "@/services";
import { mentionFiltersForApiRequestBody } from "@/lib/helpers/mention-filter-api";
import {
  displayLabelForMentionModel,
  displayLabelForMentionSentiment,
} from "@/lib/helpers/mention-filter-label-helpers";
import {
  DEFAULT_PAGE_SIZE,
} from "@/config";

interface MentionsTableProps {
  filtersForApi: MentionFilters;
}

interface SuccessfulMentionsTableView {
  filtersSerialized: string;
  page: number;
  perPage: number;
  response: MentionsResponse;
}

const columnHelper = createColumnHelper<Mention>();

export function MentionsTable({ filtersForApi }: MentionsTableProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [lastSuccessfulTableView, setLastSuccessfulTableView] =
    useState<SuccessfulMentionsTableView | null>(null);
  const lastHandledFailedRequestKeyRef = useRef<string | null>(null);

  const filtersSerialized = useMemo(
    () => JSON.stringify(filtersForApi),
    [filtersForApi]
  );

  useEffect(() => {
    setPage(1);
  }, [filtersSerialized]);

  const requestFilters = useMemo(
    () => mentionFiltersForApiRequestBody(filtersForApi),
    [filtersForApi]
  );

  const mentionsQuery = brandMentionsApiService.useMentions({
    page,
    per_page: perPage,
    filters: requestFilters,
  });

  const currentRequestKey = useMemo(
    () => `${filtersSerialized}::${page}::${perPage}`,
    [filtersSerialized, page, perPage]
  );

  useEffect(() => {
    const successfulResponse = mentionsQuery.data;
    if (!successfulResponse || mentionsQuery.isLoading || mentionsQuery.error) return;

    setLastSuccessfulTableView((previousTableView) => {
      if (
        previousTableView &&
        previousTableView.filtersSerialized === filtersSerialized &&
        previousTableView.page === page &&
        previousTableView.perPage === perPage
      ) {
        return previousTableView;
      }

      return {
        filtersSerialized,
        page,
        perPage,
        response: successfulResponse,
      };
    });
    lastHandledFailedRequestKeyRef.current = null;
  }, [
    mentionsQuery.data,
    mentionsQuery.error,
    mentionsQuery.isLoading,
    filtersSerialized,
    page,
    perPage,
  ]);

  const isTableNavigationPending =
    lastSuccessfulTableView !== null &&
    lastSuccessfulTableView.filtersSerialized === filtersSerialized &&
    (lastSuccessfulTableView.page !== page ||
      lastSuccessfulTableView.perPage !== perPage);

  const displayedResponse =
    mentionsQuery.data ??
    (isTableNavigationPending ? lastSuccessfulTableView?.response : undefined);

  useEffect(() => {
    if (!mentionsQuery.error) return;
    if (lastHandledFailedRequestKeyRef.current === currentRequestKey) return;

    if (isTableNavigationPending && lastSuccessfulTableView) {
      lastHandledFailedRequestKeyRef.current = currentRequestKey;

      const requestedPage = page;
      const requestedPerPage = perPage;

      setPage(lastSuccessfulTableView.page);
      setPerPage(lastSuccessfulTableView.perPage);

      if (requestedPage !== lastSuccessfulTableView.page) {
        toast.error(
          `Failed to load page ${requestedPage}. Restored page ${lastSuccessfulTableView.page}.`
        );
        return;
      }

      if (requestedPerPage !== lastSuccessfulTableView.perPage) {
        toast.error("Failed to update rows. Restored the previous table view.");
        return;
      }
    }

    lastHandledFailedRequestKeyRef.current = currentRequestKey;
    toast.error(mentionsQuery.error.message);
  }, [
    mentionsQuery.error,
    currentRequestKey,
    isTableNavigationPending,
    lastSuccessfulTableView,
    page,
    perPage,
  ]);

  const data = displayedResponse?.data ?? [];
  const total = displayedResponse?.total ?? 0;
  const hasDisplayedResponse = displayedResponse !== undefined;
  const isInitialLoad = mentionsQuery.isLoading && !hasDisplayedResponse;
  const isOverlayLoading = mentionsQuery.isLoading && isTableNavigationPending;
  const pageState: MentionsTablePageState = isInitialLoad
    ? mentionsTablePageStates.LOADING
    : mentionsQuery.error && !hasDisplayedResponse
      ? mentionsTablePageStates.FAILED
      : data.length === 0
        ? mentionsTablePageStates.EMPTY
        : mentionsTablePageStates.DONE;

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const handlePerPageChange = useCallback((nextPerPage: number) => {
    setPerPage(nextPerPage);
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const columns = useMemo(
    () => [
      columnHelper.accessor("query_text", {
        header: "Query",
        cell: (info) => (
          <span
            className="max-w-[200px] truncate block font-medium text-foreground"
            title={info.getValue()}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("model", {
        header: "Model",
        cell: (info) => (
          <Badge variant="outline" className={mentionsTableModelNameBadgeClassName}>
            {displayLabelForMentionModel(info.getValue())}
          </Badge>
        ),
      }),
      columnHelper.accessor("mentioned", {
        header: "Mentioned",
        cell: (info) => (
          <Badge
            variant="outline"
            className={
              info.getValue()
                ? mentionsTableMentionedYesBadgeClassName
                : mentionsTableMentionedNoBadgeClassName
            }
          >
            {info.getValue() ? "Yes" : "No"}
          </Badge>
        ),
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
          const title = displayLabelForMentionSentiment(val);
          return (
            <Badge
              variant="outline"
              className={`border-transparent ${mentionsTableSentimentChipClassNameBySentiment[val] ?? "bg-muted text-muted-foreground"}`}
            >
              {title}
            </Badge>
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
              className="inline-flex items-center gap-1 font-medium text-sky-700 underline-offset-2 hover:text-sky-800 hover:underline dark:text-sky-400 dark:hover:text-sky-300"
            >
              <ExternalLink className="size-3" />
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
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination: { pageIndex: page - 1, pageSize: perPage },
    },
  });

  const tableHeader = (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow
          key={headerGroup.id}
          className="border-b border-border/70 bg-muted/35 hover:bg-muted/35"
        >
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id}>
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

  const loadingContent = (
    <>
      <CardContent className="p-0">
        <Table>
          {tableHeader}
          <TableBody>
            {Array.from({ length: perPage }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {columns.map((_, colIndex) => (
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

  const tableLoadingOverlay = isOverlayLoading ? (
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
  ) : null;

  const pageContent =
    pageState === mentionsTablePageStates.EMPTY ? (
      <CardContent className="flex flex-col items-center justify-center bg-muted/20 py-14">
        <p className="text-sm text-muted-foreground">
          No mentions match your filters.
        </p>
      </CardContent>
    ) : pageState === mentionsTablePageStates.FAILED ? (
      <CardContent className="flex flex-col items-center justify-center bg-muted/20 py-14">
        <p className="text-sm font-medium text-foreground">
          Unable to load brand mentions.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Please try again in a moment.
        </p>
      </CardContent>
    ) : (
      <>
        <div className="relative">
          <CardContent className="p-0">
            <Table>
              {tableHeader}
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
          </CardContent>
          {tableLoadingOverlay}
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString()} total results
          </p>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">Rows</span>
              <Select
                value={String(perPage)}
                onValueChange={(val) => handlePerPageChange(Number(val))}
                disabled={mentionsQuery.isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous page"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || mentionsQuery.isLoading}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next page"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || mentionsQuery.isLoading}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      </>
    );

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>Brand Mentions</CardTitle>
      </CardHeader>
      {pageState === mentionsTablePageStates.LOADING ? loadingContent : pageContent}
    </Card>
  );
}
