export const DashboardSkeleton = () => {
  return (
    <section className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 rounded-lg bg-zinc-800" />
        <div className="h-8 w-32 rounded-lg bg-zinc-800" />
      </div>

      {/* KPI Cards row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5"
          >
            <div className="mb-3 h-4 w-24 rounded bg-zinc-800" />
            <div className="mb-2 h-8 w-32 rounded bg-zinc-800" />
            <div className="h-3 w-20 rounded bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
          <div className="mb-4 h-4 w-40 rounded bg-zinc-800" />
          <div className="h-56 rounded-lg bg-zinc-800/50" />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
          <div className="mb-4 h-4 w-40 rounded bg-zinc-800" />
          <div className="h-56 rounded-lg bg-zinc-800/50" />
        </div>
      </div>

      {/* Full-width chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
        <div className="mb-4 h-4 w-40 rounded bg-zinc-800" />
        <div className="h-56 rounded-lg bg-zinc-800/50" />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
          <div className="mb-4 h-4 w-32 rounded bg-zinc-800" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-zinc-800/50" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
          <div className="mb-4 h-4 w-32 rounded bg-zinc-800" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 rounded-lg bg-zinc-800/50" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
