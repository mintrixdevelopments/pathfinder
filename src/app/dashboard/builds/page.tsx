"use client";

import { motion } from "framer-motion";
import { useBuilds } from "../builds-context";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  queued: "bg-amber-50 text-amber-700 border-amber-200",
  planned: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function BuildsPage() {
  const { builds } = useBuilds();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Builds</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every build request sent to Pathfinder, and its status.</p>
      </div>

      {builds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No builds yet. Head to Overview and describe what you want to build.
        </div>
      ) : (
        <motion.div className="flex flex-col gap-2" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
          {builds.map((build) => (
            <motion.div
              key={build.id}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3.5 transition-colors hover:border-neutral-300"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="truncate text-sm font-medium text-foreground">{build.prompt}</span>
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
                      <span className="rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase">
                        {action.type}
                      </span>
                      {action.description}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
