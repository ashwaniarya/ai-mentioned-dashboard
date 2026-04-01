export function DashboardHeader() {
  return (
    <header>
      <div className="mx-auto flex max-w-7xl items-start justify-between px-4 py-3 sm:items-center sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            <span className="sm:hidden">Brand Mentions</span>
            <span className="hidden sm:inline">Brand Mentions Dashboard</span>
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
            Track how your brand is mentioned across AI models
          </p>
        </div>
      </div>
    </header>
  );
}
