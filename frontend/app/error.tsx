"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DashboardErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardErrorBoundary({
  error,
  reset,
}: DashboardErrorBoundaryProps) {
  useEffect(() => {
    console.error(error);
    toast.error("Something went wrong while loading the dashboard.");
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Dashboard failed to load
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            An unexpected error interrupted this screen. Try loading it again.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={reset}>
            <RotateCcw className="size-4" />
            Try again
          </Button>
        </div>
      </section>
    </main>
  );
}
