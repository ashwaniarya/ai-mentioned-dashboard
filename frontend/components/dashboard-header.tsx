export function DashboardHeader() {
  return (
    <header>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Brand Mentions Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Track how your brand is mentioned across AI models
          </p>
        </div>
      </div>
    </header>
  );
}
