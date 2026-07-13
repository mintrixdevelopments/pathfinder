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

export interface Project {
  id: string;
  name: string;
  connectedAt: string;
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

export function BuildsProvider({ children }: { children: ReactNode }) {
  const [builds, setBuilds] = useState<BuildEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  function addBuild(build: BuildEntry) {
    setBuilds((prev) => [build, ...prev]);
  }

  function addProject(name: string) {
    const id = `proj_${Date.now()}`;
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
