"use client";

import { useState } from "react";
import { useBuilds, type BuildAction } from "./builds-context";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  queued: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  planned: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export default function DashboardPage() {
  const { builds, addBuild } = useBuilds();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate build plan");
      }

      const data: { id: string; prompt: string; actions: BuildAction[]; status: "planned" } =
        await res.json();

      addBuild({
        id: data.id,
        prompt: data.prompt,
        status: data.status,
        timestamp: "just now",
        actions: data.actions,
      });
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">What do you want to build?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe a feature, system, or change. Pathfinder will plan and execute it inside Roblox Studio.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface transition-colors focus-within:border-border-hover">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Build a modern simulator game with pets, UI, datastores, NPCs, and a shop."
          rows={4}
          className="w-full resize-none bg-transparent px-4 py-3 text-sm placeholder:text-muted focus:outline-none"
        />
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          <span className="text-xs text-muted">
            {prompt.length > 0 ? `${prompt.length} characters` : "Connected to: My Roblox Game"}
          </span>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGenerating ? "Planning…" : "Generate"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Recent activity</h2>
        <div className="flex flex-col gap-2">
          {builds.slice(0, 3).map((build) => (
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
