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
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { Mention, MentionFilters } from "@/models";
import { brandMentionsApiService } from "@/services";
import { mentionFiltersForApiRequestBody } from "@/lib/validation";
import { DEFAULT_PAGE_SIZE } from "@/config";

interface MentionsTableProps {
  filtersForApi: MentionFilters;
}

const columnHelper = createColumnHelper<Mention>();

const sentimentColorMap: Record<string, string> = {
  positive:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  neutral:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  negative: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

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
          <span className="max-w-[200px] truncate block" title={info.getValue()}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("model", {
        header: "Model",
        cell: (info) => (
          <Badge variant="secondary" className="capitalize">
            {info.getValue()}
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
                ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
                : "border-red-300 text-red-700 dark:border-red-700 dark:text-red-400"
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
          return val !== null ? `#${val}` : "—";
        },
      }),
      columnHelper.accessor("sentiment", {
        header: "Sentiment",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return "—";
          return (
            <Badge
              variant="outline"
              className={`border-transparent ${sentimentColorMap[val] ?? ""}`}
            >
              {val}
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
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="size-3" />
              Link
            </a>
          );
        },
      }),
      columnHelper.accessor("created_at", {
        header: "Date",
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
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

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-sm">
            No mentions match your filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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
    </Card>
  );
}
