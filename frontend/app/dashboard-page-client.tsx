"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { MentionsTable } from "@/components/mention-table/mentions-table";
import { TrendChart } from "@/components/trend-chart/trend-chart";

export function DashboardPageClient() {
  return (
    <>
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DashboardHeader />
        {/* Standalone filters will be rendered by the individual components */}
      </div>
      <main className="mx-auto max-w-7xl space-y-dashboard-xl p-dashboard-md sm:p-dashboard-lg lg:p-dashboard-xl">
        <TrendChart />

        <MentionsTable />
      </main>
    </>
  );
}
