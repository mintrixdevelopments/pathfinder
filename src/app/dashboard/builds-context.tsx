"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface BuildAction {
  type: string;
  description: string;
}

export interface BuildEntry {
  id: string;
  prompt: string;
  status: "completed" | "failed" | "queued" | "planned";
  timestamp: string;
  actions?: BuildAction[];
}

const SEED_BUILDS: BuildEntry[] = [
  {
    id: "bld_seed_1",
    prompt: "Build a modern simulator game with pets, UI, datastores, NPCs, and a shop.",
    status: "completed",
    timestamp: "2h ago",
    actions: [
      { type: "UI", description: "Create shop interface with item listings" },
      { type: "Script", description: "Add purchase and currency deduction logic" },
      { type: "Datastore", description: "Create pet inventory datastore schema" },
    ],
  },
  {
    id: "bld_seed_2",
    prompt: "Add a leaderboard UI showing top 10 players by coins.",
    status: "failed",
    timestamp: "5h ago",
  },
];

interface BuildsContextValue {
  builds: BuildEntry[];
  addBuild: (build: BuildEntry) => void;
}

const BuildsContext = createContext<BuildsContextValue | null>(null);

export function BuildsProvider({ children }: { children: ReactNode }) {
  const [builds, setBuilds] = useState<BuildEntry[]>(SEED_BUILDS);

  function addBuild(build: BuildEntry) {
    setBuilds((prev) => [build, ...prev]);
  }

  return (
    <BuildsContext.Provider value={{ builds, addBuild }}>
      {children}
    </BuildsContext.Provider>
  );
}

export function useBuilds() {
  const ctx = useContext(BuildsContext);
  if (!ctx) throw new Error("useBuilds must be used within BuildsProvider");
  return ctx;
}
