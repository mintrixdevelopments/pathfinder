"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBuilds, type BuildAction } from "./builds-context";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: BuildAction[];
  isError?: boolean;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-neutral-400"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function CompleteBadge() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.15 }}
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { addBuild, activeProject } = useBuilds();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [prompt]);

  async function handleGenerate() {
    if (!prompt.trim() || isGenerating) return;
    const userPrompt = prompt.trim();
    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, role: "user", content: userPrompt }]);
    setPrompt("");
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate build plan");
      }
      const data: { id: string; prompt: string; actions: BuildAction[]; status: "planned" } = await res.json();

      setMessages((prev) => [
        ...prev,
        { id: `a_${data.id}`, role: "assistant", content: "Here's the plan for that:", actions: data.actions },
      ]);
      addBuild({ id: data.id, prompt: data.prompt, status: data.status, timestamp: "just now", actions: data.actions });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: `err_${Date.now()}`, role: "assistant", content: err instanceof Error ? err.message : "Something went wrong.", isError: true },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-6 py-8">
      <AnimatePresence>
        {!activeProject && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800"
          >
            No project connected yet. Connect one in{" "}
            <a href="/dashboard/projects" className="font-medium underline">
              Projects
            </a>{" "}
            before builds can be sent to Roblox Studio.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col items-center justify-center text-center">
            <h1 className="text-xl font-semibold tracking-tight">What do you want to build?</h1>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Describe a feature, system, or change. Pathfinder will plan it out below.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4 pb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-accent px-4 py-2.5 text-sm text-white">
                      {msg.content}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex justify-start"
                  >
                    <div className={`max-w-[80%] rounded-2xl rounded-tl-sm border px-4 py-3 text-sm ${msg.isError ? "border-red-200 bg-red-50 text-red-700" : "border-border bg-surface text-foreground"}`}>
                      <div className="flex items-center gap-2">
                        {!msg.isError && msg.actions && msg.actions.length > 0 && <CompleteBadge />}
                        <p>{msg.content}</p>
                      </div>
                      {msg.actions && msg.actions.length > 0 && (
                        <motion.div
                          className="mt-2.5 flex flex-col gap-1.5 border-t border-border pt-2.5"
                          initial="hidden"
                          animate="show"
                          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                        >
                          {msg.actions.map((action, i) => (
                            <motion.div
                              key={i}
                              variants={{ hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0 } }}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <span className="rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase">
                                {action.type}
                              </span>
                              {action.description}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )
              )}
              {isGenerating && (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm border border-border bg-surface px-3 py-2">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <motion.div layout className="mt-4 rounded-xl border border-border bg-surface transition-all focus-within:border-neutral-400 focus-within:ring-4 focus-within:ring-neutral-100">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Build a modern simulator game with pets, UI, datastores, NPCs, and a shop."
          rows={3}
          className="w-full resize-none bg-transparent px-4 py-3 text-sm placeholder:text-muted focus:outline-none"
        />
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          <span className="text-xs text-muted">
            {activeProject ? `Connected to: ${activeProject.name}` : "No project connected"}
          </span>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGenerating ? "Planning…" : "Generate"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
