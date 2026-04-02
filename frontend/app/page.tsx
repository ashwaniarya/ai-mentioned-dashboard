import { Suspense } from "react";
import { DashboardPageClient } from "@/app/dashboard-page-client";
import { DashboardHeader } from "@/components/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <>
          <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <DashboardHeader />
          </div>
          <main className="mx-auto max-w-7xl space-y-dashboard-xl p-dashboard-md sm:p-dashboard-lg lg:p-dashboard-xl">
            <Skeleton className="h-72 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </main>
        </>
      }
    >
      <DashboardPageClient />
    </Suspense>
  );
}
