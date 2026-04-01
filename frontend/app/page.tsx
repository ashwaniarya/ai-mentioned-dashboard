import { Suspense } from "react";
import { DashboardPageClient } from "@/app/dashboard-page-client";
import { DashboardHeader } from "@/components/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardFiltersSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 sm:pb-4 lg:px-8">
      <Skeleton className="h-14 w-full rounded-xl sm:h-24 sm:rounded-lg" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <>
          <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <DashboardHeader />
            <DashboardFiltersSkeleton />
          </div>
          <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
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
