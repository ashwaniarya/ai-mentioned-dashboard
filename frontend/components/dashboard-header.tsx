import { Sparkles } from "lucide-react";

import { ColorSchemeToggleButton } from "@/components/color-scheme-toggle-button";
import {
  DashboardDisplayHeading,
  DashboardSupportingText,
} from "@/components/ui/typography";

export function DashboardHeader() {
  return (
    <header>
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-dashboard-md px-dashboard-md py-dashboard-md sm:items-center sm:px-dashboard-lg lg:px-dashboard-xl">
        <div className="flex min-w-0 items-center gap-dashboard-md">
          <div
            className="shrink-0 rounded-lg bg-primary/10 p-[length:var(--dashboard-header-mark-icon-padding)] text-primary"
            aria-hidden
          >
            <Sparkles
              className="size-[length:var(--dashboard-header-mark-icon-size)]"
              strokeWidth={2}
            />
          </div>
          <div className="min-w-0">
            <DashboardDisplayHeading className="text-[length:var(--dashboard-type-section-size)] leading-[var(--dashboard-type-section-line-height)] tracking-normal">
              Track Your Brand
            </DashboardDisplayHeading>
            <DashboardSupportingText className="mt-dashboard-xs max-w-2xl">
              Track how your brand is mentioned across AI models
            </DashboardSupportingText>
          </div>
        </div>
        <div className="shrink-0 self-start sm:self-auto">
          <ColorSchemeToggleButton />
        </div>
      </div>
    </header>
  );
}
