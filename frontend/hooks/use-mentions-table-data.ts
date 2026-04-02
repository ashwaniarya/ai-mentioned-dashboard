import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Mention, MentionFilters, MentionsResponse } from "@/models";
import { brandMentionsApiService } from "@/services";
import { mentionFiltersForApiRequestBody } from "@/lib/helpers/mention-filters";
import { DEFAULT_PAGE_SIZE } from "@/config";

export type MentionsTableViewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; rows: Mention[]; total: number; isRefetching: boolean };

export interface MentionsTableDataResult {
  viewState: MentionsTableViewState;
  page: number;
  perPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  changePerPage: (perPage: number) => void;
}

interface LastSuccessfulView {
  filtersSerialized: string;
  page: number;
  perPage: number;
  response: MentionsResponse;
}

export function useMentionsTableData(
  filtersForApi: MentionFilters
): MentionsTableDataResult {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [lastSuccessfulView, setLastSuccessfulView] =
    useState<LastSuccessfulView | null>(null);
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

  const currentRequestKey = `${filtersSerialized}::${page}::${perPage}`;

  // ── Track successful responses ──────────────────────────────────────
  useEffect(() => {
    const successfulResponse = mentionsQuery.data;
    if (!successfulResponse || mentionsQuery.isLoading || mentionsQuery.error)
      return;

    setLastSuccessfulView((previous) => {
      if (
        previous &&
        previous.filtersSerialized === filtersSerialized &&
        previous.page === page &&
        previous.perPage === perPage
      ) {
        return previous;
      }
      return { filtersSerialized, page, perPage, response: successfulResponse };
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

  // ── Stale response (same filters, different page/perPage) ───────────
  const staleResponse =
    lastSuccessfulView !== null &&
    lastSuccessfulView.filtersSerialized === filtersSerialized &&
    (lastSuccessfulView.page !== page ||
      lastSuccessfulView.perPage !== perPage)
      ? lastSuccessfulView.response
      : undefined;

  const hasStaleData = staleResponse !== undefined;

  // ── Error rollback + toast ──────────────────────────────────────────
  useEffect(() => {
    if (!mentionsQuery.error) return;
    if (lastHandledFailedRequestKeyRef.current === currentRequestKey) return;

    if (hasStaleData && lastSuccessfulView) {
      lastHandledFailedRequestKeyRef.current = currentRequestKey;

      const requestedPage = page;
      const requestedPerPage = perPage;

      setPage(lastSuccessfulView.page);
      setPerPage(lastSuccessfulView.perPage);

      if (requestedPage !== lastSuccessfulView.page) {
        toast.error(
          `Failed to load page ${requestedPage}. Restored page ${lastSuccessfulView.page}.`
        );
        return;
      }

      if (requestedPerPage !== lastSuccessfulView.perPage) {
        toast.error(
          "Failed to update rows. Restored the previous table view."
        );
        return;
      }
    }

    lastHandledFailedRequestKeyRef.current = currentRequestKey;
    toast.error(mentionsQuery.error.message);
  }, [
    mentionsQuery.error,
    currentRequestKey,
    hasStaleData,
    lastSuccessfulView,
    page,
    perPage,
  ]);

  // ── Derive view state ───────────────────────────────────────────────
  const viewState = useMemo<MentionsTableViewState>(() => {
    if (mentionsQuery.data) {
      return mentionsQuery.data.data.length === 0
        ? { status: "empty" }
        : {
            status: "ready",
            rows: mentionsQuery.data.data,
            total: mentionsQuery.data.total,
            isRefetching: false,
          };
    }

    if (staleResponse) {
      if (mentionsQuery.isLoading) {
        return {
          status: "ready",
          rows: staleResponse.data,
          total: staleResponse.total,
          isRefetching: true,
        };
      }
      return staleResponse.data.length === 0
        ? { status: "empty" }
        : {
            status: "ready",
            rows: staleResponse.data,
            total: staleResponse.total,
            isRefetching: false,
          };
    }

    if (mentionsQuery.isLoading) return { status: "loading" };
    if (mentionsQuery.error)
      return { status: "error", message: mentionsQuery.error.message };

    return { status: "empty" };
  }, [
    mentionsQuery.data,
    mentionsQuery.isLoading,
    mentionsQuery.error,
    staleResponse,
  ]);

  // ── Pagination helpers ──────────────────────────────────────────────
  const total = viewState.status === "ready" ? viewState.total : 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const goToPage = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const changePerPage = useCallback((nextPerPage: number) => {
    setPerPage(nextPerPage);
    setPage(1);
  }, []);

  return { viewState, page, perPage, totalPages, goToPage, changePerPage };
}
