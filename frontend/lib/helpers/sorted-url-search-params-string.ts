/**
 * Deterministic serialization for `URLSearchParams`: sort by key, then by value.
 * Use for stable string equality (e.g. comparing filter state in the query string).
 */
export function sortedUrlSearchParamsString(params: URLSearchParams): string {
  const entries: [string, string][] = [];
  params.forEach((value, key) => {
    entries.push([key, value]);
  });
  entries.sort((a, b) =>
    a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])
  );
  return new URLSearchParams(entries).toString();
}
