export const trendChartPageStates = {
  LOADING: "LOADING",
  EMPTY: "EMPTY",
  FAILED: "FAILED",
  DONE: "DONE",
} as const;

export type TrendChartPageState =
  (typeof trendChartPageStates)[keyof typeof trendChartPageStates];
