"use client";

import { useBuilds } from "../builds-context";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  queued: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  planned: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export default function BuildsPage() {
  const { builds } = useBuilds();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Builds</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every build request sent to Pathfinder, and its status.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {builds.map((build) => (
          <div key={build.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-border-hover">
            <div className="flex items-center justify-between gap-4">
              <span className="truncate text-sm text-foreground">{build.prompt}</span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-muted">{build.timestamp}</span>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${STATUS_STYLES[build.status]}`}>
                  {build.status}
                </span>
              </div>
            </div>
            {build.actions && build.actions.length > 0 && (
              <div className="flex flex-col gap-1 border-t border-border pt-2">
                {build.actions.map((action, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase">
                      {action.type}
                    </span>
                    {action.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
