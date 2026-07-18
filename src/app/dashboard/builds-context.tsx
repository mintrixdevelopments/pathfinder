"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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

export interface Project {
  id: string;
  name: string;
  connectedAt: string;
}

interface PersistedWorkspace {
  version: 1;
  builds: BuildEntry[];
  projects: Project[];
  activeProjectId: string | null;
}

interface BuildsContextValue {
  builds: BuildEntry[];
  addBuild: (build: BuildEntry) => void;
  projects: Project[];
  activeProject: Project | null;
  addProject: (name: string) => void;
  setActiveProject: (id: string) => void;
}

const BuildsContext = createContext<BuildsContextValue | null>(null);

export function BuildsProvider({ children, userKey }: { children: ReactNode; userKey: string }) {
  const [builds, setBuilds] = useState<BuildEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const storageKey = useMemo(() => `pf:workspace:v1:${userKey.trim().toLowerCase()}`, [userKey]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<PersistedWorkspace>;
          const savedProjects = Array.isArray(saved.projects) ? saved.projects : [];
          setProjects(savedProjects);
          setBuilds(Array.isArray(saved.builds) ? saved.builds : []);
          setActiveProjectId(
            typeof saved.activeProjectId === "string" && savedProjects.some((project) => project.id === saved.activeProjectId)
              ? saved.activeProjectId
              : savedProjects[0]?.id || null
          );
        }
      } catch (error) {
        console.error("Pathfinder workspace restore failed", error);
      } finally {
        setHydrated(true);
      }
    });
    return () => { cancelled = true; };
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    const workspace: PersistedWorkspace = { version: 1, builds, projects, activeProjectId };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(workspace));
    } catch (error) {
      console.error("Pathfinder workspace save failed", error);
    }
  }, [activeProjectId, builds, hydrated, projects, storageKey]);

  function addBuild(build: BuildEntry) {
    setBuilds((prev) => [build, ...prev]);
  }

  function addProject(name: string) {
    const id = `proj_${crypto.randomUUID()}`;
    setProjects((prev) => [{ id, name, connectedAt: "just now" }, ...prev]);
    setActiveProjectId(id);
  }

  function setActiveProject(id: string) {
    setActiveProjectId(id);
  }

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  return (
    <BuildsContext.Provider value={{ builds, addBuild, projects, activeProject, addProject, setActiveProject }}>
      {children}
    </BuildsContext.Provider>
  );
}

export function useBuilds() {
  const ctx = useContext(BuildsContext);
  if (!ctx) throw new Error("useBuilds must be used within BuildsProvider");
  return ctx;
}
