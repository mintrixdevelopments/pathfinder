"use client";

import Link from "next/link";
import { useBuilds } from "./builds-context";

export function ProjectSwitcher() {
  const { activeProject } = useBuilds();

  return (
    <Link href="/dashboard/initiatives" className="mx-3 mt-3 flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-left transition-colors hover:border-border-hover hover:bg-surface-hover">
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wide text-muted">Initiative</span>
        <span className="text-sm font-medium">{activeProject ? activeProject.name : "None selected"}</span>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted">
        <path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" />
      </svg>
    </Link>
  );
}
