import Link from "next/link";
import { BuildsProvider } from "./builds-context";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: "grid" },
  { label: "Builds", href: "/dashboard/builds", icon: "layers" },
  { label: "Projects", href: "/dashboard/projects", icon: "folder" },
  { label: "Settings", href: "/dashboard/settings", icon: "settings" },
] as const;

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    layers: (
      <>
        <path d="M12 2 2 7l10 5 10-5-10-5Z" />
        <path d="m2 17 10 5 10-5" />
        <path d="m2 12 10 5 10-5" />
      </>
    ),
    folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />,
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      {paths[name]}
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface/60">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-xs font-semibold text-white">
            P
          </div>
          <span className="text-sm font-medium tracking-tight">Pathfinder</span>
        </div>

        <button className="mx-3 mt-3 flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-left transition-colors hover:border-border-hover hover:bg-surface-hover">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-muted">Project</span>
            <span className="text-sm font-medium">My Roblox Game</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted">
            <path d="m7 15 5 5 5-5" />
            <path d="m7 9 5-5 5 5" />
          </svg>
        </button>

        <nav className="mt-4 flex flex-col gap-0.5 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-surface-hover">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-hover text-xs font-medium">
              MD
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">Mintrix Dev</span>
              <span className="truncate text-xs text-muted">Alpha Build</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
          <span className="text-sm text-muted-foreground">Dashboard</span>
          <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            Alpha · Dev Build
          </span>
        </header>
        <main className="flex-1 overflow-y-auto"><BuildsProvider>{children}</BuildsProvider></main>
      </div>
    </div>
  );
}
