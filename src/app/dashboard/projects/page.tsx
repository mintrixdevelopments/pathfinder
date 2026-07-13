"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBuilds } from "../builds-context";

export default function ProjectsPage() {
  const { projects, activeProject, addProject, setActiveProject } = useBuilds();
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);

  function handleConnect() {
    if (!name.trim()) return;
    addProject(name.trim());
    setName("");
    setShowForm(false);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">Roblox games connected to Pathfinder.</p>
      </div>

      {projects.length === 0 && !showForm && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">No projects connected yet. Connect a Roblox game to start building.</p>
        </div>
      )}

      <AnimatePresence>
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{project.name}</span>
                <span className="text-xs text-muted">Connected {project.connectedAt}</span>
              </div>
              {activeProject?.id === project.id ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  Active
                </span>
              ) : (
                <button onClick={() => setActiveProject(project.id)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-neutral-300 hover:text-foreground">
                  Set active
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {showForm ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-surface p-5">
          <label className="text-xs font-medium text-muted-foreground">Project name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Roblox Game"
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
            autoFocus
          />
          <div className="mt-3 flex gap-2">
            <button onClick={handleConnect} disabled={!name.trim()} className="rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40">
              Connect
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover">
              Cancel
            </button>
          </div>
        </motion.div>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-fit rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-neutral-300 hover:bg-surface-hover hover:text-foreground">
          + Connect a new project
        </button>
      )}
    </div>
  );
}
