"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBuilds, type BuildAction } from "./builds-context";

type BadgeStatus = "pending" | "success" | "blocked";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  actions?: BuildAction[];
  suggestions?: string[];
  badgeStatus?: BadgeStatus;
}

const STARTER_SUGGESTIONS = [
  "Add a shop with rarities and a purchase UI",
  "Build a pet system with equip and follow behavior",
  "Create a PvP arena with weapon mechanics",
  "Add a leaderboard tracking player wins",
];

const DAILY_LIMIT = 15;

function getTodayKey() {
  return `pf_generations_${new Date().toISOString().slice(0, 10)}`;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-neutral-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: BadgeStatus }) {
  if (status === "pending") {
    return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "#f59e0b" }}>
        <span className="text-[11px] font-bold leading-none text-white">!</span>
      </motion.div>
    );
  }
  if (status === "blocked") {
    return (
      <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "#ef4444" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" className="h-3 w-3">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "#10b981" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </motion.div>
  );
}

function SuggestionChips({ items, onPick }: { items: string[]; onPick: (text: string) => void }) {
  return (
    <motion.div className="flex flex-wrap gap-1.5" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
      {items.map((s, i) => (
        <motion.button key={i} variants={{ hidden: { opacity: 0, y: 4 }, show: { opacity: 1, y: 0 } }} onClick={() => onPick(s)} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50">
          {s}
        </motion.button>
      ))}
    </motion.div>
  );
}

function ModelSelector() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Gemini 3.1 Flash Lite
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-neutral-400">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="absolute left-0 top-full z-20 mt-1 w-60 rounded-lg border border-border bg-white p-1 shadow-lg">
          <div className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-900">
            Gemini 3.1 Flash Lite
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-emerald-500">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div className="mt-1 flex items-center justify-between rounded-md px-3 py-2 text-xs text-neutral-400">
            More models
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px]">Coming soon</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function GenerationMeter({ count, limit }: { count: number; limit: number }) {
  const remaining = limit - count;
  const pct = Math.min(100, (count / limit) * 100);
  const theme = remaining <= 0
    ? { bar: "#ef4444", text: "text-red-700", bg: "bg-red-50", border: "border-red-200" }
    : remaining <= 3
    ? { bar: "#f59e0b", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" }
    : { bar: "#10b981", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };

  return (
    <div className={`flex flex-1 items-center gap-3 rounded-lg border ${theme.border} ${theme.bg} px-3 py-2`}>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${theme.text}`}>Daily builds</span>
          <span className={`text-xs font-semibold ${theme.text}`}>{count} / {limit}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: theme.bar }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { addBuild, activeProject } = useBuilds();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [genCount, setGenCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(getTodayKey());
    setGenCount(raw ? parseInt(raw, 10) : 0);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [prompt]);

  function incrementGenCount() {
    setGenCount((prev) => {
      const next = prev + 1;
      window.localStorage.setItem(getTodayKey(), String(next));
      return next;
    });
  }

  async function sendPrompt(text: string) {
    if (!text.trim() || isGenerating) return;

    if (!activeProject) {
      setMessages((prev) => [...prev, { id: `sys_${Date.now()}`, role: "system", content: "You need an initiative selected before I can help. Head to Initiatives and start or select one first." }]);
      return;
    }
    if (genCount >= DAILY_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    const pendingId = `a_${Date.now()}`;
    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, role: "user", content: text }, { id: pendingId, role: "assistant", content: "", badgeStatus: "pending" }]);
    setPrompt("");
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate");
      }
      const data: { id: string; prompt: string; message: string; actions: BuildAction[]; suggestions: string[]; status: "planned" | "chat" | "blocked" } = await res.json();

      incrementGenCount();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { ...m, content: data.message, actions: data.actions, suggestions: data.suggestions, badgeStatus: data.status === "blocked" ? "blocked" : "success" }
            : m
        )
      );

      if (data.status === "planned" && data.actions.length > 0) {
        addBuild({ id: data.id, prompt: data.prompt, status: "planned", timestamp: "just now", actions: data.actions });
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId ? { ...m, content: err instanceof Error ? err.message : "Something went wrong.", badgeStatus: "blocked" } : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(prompt);
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-6 py-6">
      <div className="mb-3 flex items-center gap-3">
        <ModelSelector />
        <GenerationMeter count={genCount} limit={DAILY_LIMIT} />
      </div>

      <AnimatePresence>
        {!activeProject && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 flex items-center gap-2.5 overflow-hidden rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "#f59e0b" }}>
              <span className="text-[11px] font-bold leading-none text-white">!</span>
            </span>
            No initiative selected. <a href="/dashboard/initiatives" className="font-medium underline">Start or select one</a> before I can help with builds.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col items-center justify-center text-center">
            <h1 className="text-xl font-semibold tracking-tight">What do you want to build?</h1>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Describe a feature, system, or entire game. Pathfinder will break it down.</p>
            <div className="mt-6 max-w-md">
              <SuggestionChips items={STARTER_SUGGESTIONS} onPick={(s) => setPrompt(s)} />
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4 pb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                if (msg.role === "system") {
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
                      <div className="flex max-w-[90%] items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "#f59e0b" }}>
                          <span className="text-[11px] font-bold leading-none text-white">!</span>
                        </span>
                        {msg.content}
                      </div>
                    </motion.div>
                  );
                }
                if (msg.role === "user") {
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-accent px-4 py-2.5 text-sm text-white">{msg.content}</div>
                    </motion.div>
                  );
                }
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: "easeOut" }} className="flex justify-start">
                    <div className={`max-w-[85%] rounded-2xl rounded-tl-sm border px-4 py-3 text-sm ${msg.badgeStatus === "blocked" ? "border-red-300 bg-red-100 text-red-800" : "border-border bg-surface text-foreground"}`}>
                      <div className="flex items-center gap-2">
                        {msg.badgeStatus && <StatusBadge status={msg.badgeStatus} />}
                        {msg.badgeStatus === "pending" ? <TypingDots /> : <p className="font-medium">{msg.content}</p>}
                      </div>
                      {msg.actions && msg.actions.length > 0 && (
                        <motion.div className="mt-2.5 flex flex-col gap-1.5 border-t border-border pt-2.5" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }}>
                          {msg.actions.map((action, i) => (
                            <motion.div key={i} variants={{ hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0 } }} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase">{action.type}</span>
                              {action.description}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 border-t border-border pt-3">
                          <SuggestionChips items={msg.suggestions} onPick={(s) => setPrompt(s)} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <motion.div layout className="mt-4 rounded-xl border border-border bg-surface transition-all focus-within:border-neutral-400 focus-within:ring-4 focus-within:ring-neutral-100">
        <textarea ref={textareaRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handleKeyDown} placeholder="Build a highly realistic PVP shooter with weapon mechanics, movement, and a HUD." rows={3} className="w-full resize-none bg-transparent px-4 py-3 text-sm placeholder:text-muted focus:outline-none" />
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          <span className="text-xs text-muted">{activeProject ? `Initiative: ${activeProject.name}` : "No initiative selected"}</span>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => sendPrompt(prompt)} disabled={!prompt.trim() || isGenerating} className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40">
            {isGenerating ? "Thinking…" : "Send"}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showLimitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLimitModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "#f59e0b" }}>
                <span className="text-xl font-bold leading-none text-white">!</span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-neutral-900">Daily limit reached</h2>
              <p className="mt-2 text-sm text-neutral-500">
                You've used all {DAILY_LIMIT} free builds today. Your limit resets at midnight — come back tomorrow to keep building.
              </p>
              <button onClick={() => setShowLimitModal(false)} className="mt-5 w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
