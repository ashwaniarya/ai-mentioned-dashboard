import { useEffect, useState } from "react";
import { TREND_CHART_MOBILE_LAYOUT_BREAKPOINT_PX } from "@/constants/trend-chart.constants";

export function useCompactTrendChartLayout(): boolean {
  const [isCompactTrendChartLayout, setIsCompactTrendChartLayout] =
    useState(false);

  useEffect(() => {
    const updateTrendChartLayout = () => {
      setIsCompactTrendChartLayout(
        window.innerWidth < TREND_CHART_MOBILE_LAYOUT_BREAKPOINT_PX
      );
    };

    updateTrendChartLayout();
    window.addEventListener("resize", updateTrendChartLayout);

    return () => window.removeEventListener("resize", updateTrendChartLayout);
  }, []);

  return isCompactTrendChartLayout;
}
