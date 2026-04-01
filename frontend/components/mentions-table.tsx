"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
import { LoadingFade } from "@/components/ui/loading-fade";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { Mention, MentionFilters } from "@/models";
import { brandMentionsApiService } from "@/services";
import { mentionFiltersForApiRequestBody } from "@/lib/validation";
import {
  DEFAULT_PAGE_SIZE,
  displayLabelForMentionModel,
  displayLabelForMentionSentiment,
} from "@/config";

interface MentionsTableProps {
  filtersForApi: MentionFilters;
}

const columnHelper = createColumnHelper<Mention>();

/** Filled sentiment chips: readable contrast, subtle border so they don’t look like flat stickers. */
const sentimentChipClassBySentiment: Record<string, string> = {
  positive:
    "border border-emerald-500/30 bg-emerald-500/[0.12] text-emerald-900 dark:border-emerald-400/35 dark:bg-emerald-500/15 dark:text-emerald-200",
  neutral:
    "border border-sky-500/30 bg-sky-500/[0.12] text-sky-950 dark:border-sky-400/30 dark:bg-sky-500/15 dark:text-sky-100",
  negative:
    "border border-rose-500/35 bg-rose-500/[0.12] text-rose-900 dark:border-rose-400/35 dark:bg-rose-500/15 dark:text-rose-200",
};

const modelNameBadgeClassName =
  "border border-violet-500/25 bg-violet-500/[0.1] text-violet-950 dark:border-violet-400/30 dark:bg-violet-500/12 dark:text-violet-100";

const mentionedYesBadgeClassName =
  "border-emerald-500/40 bg-emerald-500/[0.1] text-emerald-900 dark:border-emerald-500/45 dark:bg-emerald-500/15 dark:text-emerald-200";

const mentionedNoBadgeClassName =
  "border-border/80 bg-muted/70 text-muted-foreground dark:bg-muted/50";

export function MentionsTable({ filtersForApi }: MentionsTableProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);

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

  useEffect(() => {
    if (mentionsQuery.error) toast.error(mentionsQuery.error.message);
  }, [mentionsQuery.error]);

  const data = mentionsQuery.data?.data ?? [];
  const total = mentionsQuery.data?.total ?? 0;
  const isLoading = mentionsQuery.isLoading;

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
          <Badge variant="outline" className={modelNameBadgeClassName}>
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
                ? mentionedYesBadgeClassName
                : mentionedNoBadgeClassName
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
              className={`border-transparent ${sentimentChipClassBySentiment[val] ?? "bg-muted text-muted-foreground"}`}
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

  const loadingContent = (
    <>
      <CardContent className="p-0">
        <Table>
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

  const loadedContent =
    data.length === 0 ? (
      <CardContent className="flex flex-col items-center justify-center bg-muted/20 py-14">
        <p className="text-sm text-muted-foreground">
          No mentions match your filters.
        </p>
      </CardContent>
    ) : (
      <>
        <CardContent className="p-0">
          <Table>
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
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
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
      <LoadingFade isLoading={isLoading} loadingContent={loadingContent}>
        {loadedContent}
      </LoadingFade>
    </Card>
  );
}
