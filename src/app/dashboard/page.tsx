"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

interface CreditState {
  used: number;
  limit: number;
  dailyAllowance: number;
  dailyUsed: number;
  bonusCredits: number;
  remaining: number;
  resetAt: string;
}

const STARTER_SUGGESTIONS = [
  "Add a shop with rarities and a purchase UI",
  "Build a pet system with equip and follow behavior",
  "Create a PvP arena with weapon mechanics",
  "Add a leaderboard tracking player wins",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-white/70" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: BadgeStatus }) {
  if (status === "pending") {
    return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
        <span className="text-[11px] font-bold leading-none" style={{ color: "#f59e0b" }}>!</span>
      </motion.div>
    );
  }
  if (status === "blocked") {
    return (
      <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" className="h-3 w-3">
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

export default function DashboardPage() {
  const { addBuild, activeProject } = useBuilds();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [creditsUsed, setCreditsUsed] = useState<number | null>(null);
  const [creditsLimit, setCreditsLimit] = useState<number | null>(null);
  const [creditState, setCreditState] = useState<CreditState | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const refreshCredits = useCallback(() => {
    fetch("/api/generate", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.used === "number") setCreditsUsed(d.used);
        if (typeof d.limit === "number") setCreditsLimit(d.limit);
        if (typeof d.remaining === "number") setCreditState(d as CreditState);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  useEffect(() => {
    const showReferralToast = () => {
      setToast("Invite applied — 2 bonus generations added!");
      refreshCredits();
    };

    window.addEventListener("pf:referral-redeemed", showReferralToast);
    return () => window.removeEventListener("pf:referral-redeemed", showReferralToast);
  }, [refreshCredits]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [prompt]);

  async function sendPrompt(text: string) {
    if (!text.trim() || isGenerating) return;

    if (!activeProject) {
      const warningText = "You need an initiative selected before I can help. Head to Initiatives and start or select one first.";
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "system" && last.content === warningText) return prev;
        return [...prev, { id: `sys_${Date.now()}`, role: "system", content: warningText }];
      });
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
        body: JSON.stringify({
          prompt: text,
          history: messages
            .filter((message) => message.role !== "system" && message.content)
            .slice(-8)
            .map((message) => ({ role: message.role, content: message.content.slice(0, 600) })),
        }),
      });

      if (res.status === 429) {
        setShowLimitModal(true);
        setMessages((prev) => prev.filter((m) => m.id !== pendingId));
        setIsGenerating(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate");
      }

      const data: {
        id: string; prompt: string; message: string; actions: BuildAction[]; suggestions: string[];
        status: "planned" | "chat" | "blocked"; creditsUsed: number; creditsLimit: number;
      } = await res.json();

      setCreditsUsed(data.creditsUsed);
      setCreditsLimit(data.creditsLimit);
      refreshCredits();

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

  const creditsRemaining = creditState?.remaining ?? (creditsLimit !== null && creditsUsed !== null ? Math.max(0, creditsLimit - creditsUsed) : null);
  const creditTheme =
    creditsRemaining === null ? "border-border bg-surface text-muted-foreground"
    : creditsRemaining <= 0 ? "text-white" : creditsRemaining <= 3 ? "text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700";
  const creditBg = creditsRemaining === null ? undefined : creditsRemaining <= 0 ? "#ef4444" : creditsRemaining <= 3 ? "#f59e0b" : undefined;

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-6 py-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4 flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: "#10b981" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!activeProject && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 flex items-center gap-2.5 overflow-hidden rounded-lg px-4 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: "#f59e0b" }}>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
              <span className="text-[11px] font-bold leading-none" style={{ color: "#f59e0b" }}>!</span>
            </span>
            No initiative selected. <a href="/dashboard/initiatives" className="font-semibold underline">Start or select one</a> before I can help with builds.
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
                      <div className="flex max-w-[90%] items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: "#f59e0b" }}>
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
                          <span className="text-[11px] font-bold leading-none" style={{ color: "#f59e0b" }}>!</span>
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
                const isBlocked = msg.badgeStatus === "blocked";
                const isPending = msg.badgeStatus === "pending";
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: "easeOut" }} className="flex justify-start">
                    <div
                      className={`max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm ${isBlocked ? "text-white" : isPending ? "text-white" : "border border-border bg-surface text-foreground"}`}
                      style={isBlocked ? { backgroundColor: "#ef4444" } : isPending ? { backgroundColor: "#f59e0b" } : undefined}
                    >
                      <div className="flex items-center gap-2">
                        {msg.badgeStatus && <StatusBadge status={msg.badgeStatus} />}
                        {isPending ? <TypingDots /> : <p className="font-medium">{msg.content}</p>}
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
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>{activeProject ? `Initiative: ${activeProject.name}` : "No initiative selected"}</span>
            <span className="text-neutral-300">·</span>
            <span>Gemini 3.1 Flash Lite</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] font-medium text-neutral-600">
                {creditState ? `${Math.max(0, creditState.dailyAllowance - creditState.dailyUsed)} daily · ${creditState.bonusCredits} bonus` : "Loading allowance…"}
              </p>
              <p className="text-[10px] text-neutral-400">1 generation per AI request</p>
            </div>
            <span title="Greetings and basic help are handled locally without using Gemini." className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${creditTheme}`} style={creditBg ? { backgroundColor: creditBg, borderColor: creditBg } : undefined}>
              {creditsRemaining !== null ? `${Math.round(creditsRemaining)} generations left` : "…"}
            </span>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => sendPrompt(prompt)} disabled={!prompt.trim() || isGenerating} className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40">
              {isGenerating ? "Thinking…" : "Send"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showLimitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 350, damping: 28 }} className="relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
              <button onClick={() => setShowLimitModal(false)} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "#f59e0b" }}>
                <span className="text-2xl font-bold leading-none text-white">!</span>
              </div>
              <h2 className="mt-5 text-xl font-semibold text-neutral-900">No AI generations remaining</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Your daily allowance resets at midnight UTC. Greetings and basic help still work locally, or invite a friend for 2 bonus generations.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <a href="/dashboard/invite" className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
                  Invite friends
                </a>
                <button onClick={() => setShowLimitModal(false)} className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50">
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
