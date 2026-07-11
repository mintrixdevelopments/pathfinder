type BuildStatus = "completed" | "failed" | "queued";

interface BuildEntry {
  id: string;
  prompt: string;
  status: BuildStatus;
  timestamp: string;
  actions: number;
}

const BUILDS: BuildEntry[] = [
  {
    id: "bld_1",
    prompt: "Build a modern simulator game with pets, UI, datastores, NPCs, and a shop.",
    status: "completed",
    timestamp: "2h ago",
    actions: 14,
  },
  {
    id: "bld_2",
    prompt: "Add a leaderboard UI showing top 10 players by coins.",
    status: "failed",
    timestamp: "5h ago",
    actions: 3,
  },
  {
    id: "bld_3",
    prompt: "Create a datastore module for saving player pet inventory.",
    status: "queued",
    timestamp: "just now",
    actions: 0,
  },
];

const STATUS_STYLES: Record<BuildStatus, string> = {
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  queued: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function BuildsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Builds</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every build request sent to Pathfinder, and its status.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="px-4 py-3 font-medium">Prompt</th>
              <th className="px-4 py-3 font-medium">Actions</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {BUILDS.map((build) => (
              <tr
                key={build.id}
                className="border-b border-border last:border-0 transition-colors hover:bg-surface-hover"
              >
                <td className="max-w-xs truncate px-4 py-3">{build.prompt}</td>
                <td className="px-4 py-3 text-muted-foreground">{build.actions}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${STATUS_STYLES[build.status]}`}
                  >
                    {build.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{build.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
