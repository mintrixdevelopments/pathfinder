export default function ProjectsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Roblox games connected to Pathfinder.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">My Roblox Game</span>
            <span className="text-xs text-muted">Connected · Last synced 2h ago</span>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            Active
          </span>
        </div>
      </div>

      <button className="w-fit rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-border-hover hover:bg-surface-hover hover:text-foreground">
        + Connect a new project
      </button>
    </div>
  );
}
