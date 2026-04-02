import {
  DashboardDisplayHeading,
  DashboardSupportingText,
} from "@/components/ui/typography";

export function DashboardHeader() {
  return (
    <header>
      <div className="mx-auto flex max-w-7xl items-start justify-between px-dashboard-md py-dashboard-md sm:items-center sm:px-dashboard-lg lg:px-dashboard-xl">
        <div className="min-w-0">
          <DashboardDisplayHeading>
            <span className="sm:hidden">Brand Mentions</span>
            <span className="hidden sm:inline">Brand Mentions Dashboard</span>
          </DashboardDisplayHeading>
          <DashboardSupportingText className="mt-1 max-w-2xl">
            Track how your brand is mentioned across AI models
          </DashboardSupportingText>
        </div>
      </div>
    </header>
  );
}
