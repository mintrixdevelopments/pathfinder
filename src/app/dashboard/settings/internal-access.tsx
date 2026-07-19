"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function InternalAccess({ active, configured }: { active: boolean; configured: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(active);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function update(action: "activate" | "disable") {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/account/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "activate" ? { action, key } : { action }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Access denied.");
      const nextEnabled = payload.active === true;
      setEnabled(nextEnabled);
      setKey("");
      setMessage(nextEnabled ? "Access active." : "Access disabled.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Access denied.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium">Internal access</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted hover:text-foreground">Close</button>
      </div>
      {enabled ? (
        <button type="button" onClick={() => update("disable")} disabled={loading} className="mt-4 rounded-lg border border-border px-3.5 py-2 text-xs font-medium hover:bg-neutral-50 disabled:opacity-50">
          {loading ? "Working…" : "Disable"}
        </button>
      ) : (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input type="password" value={key} onChange={(event) => setKey(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && key) update("activate"); }} disabled={loading || !configured} autoComplete="off" placeholder="Access key" className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 disabled:opacity-50" />
          <button type="button" onClick={() => update("activate")} disabled={loading || !configured || !key} className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50">
            {loading ? "Checking…" : "Continue"}
          </button>
        </div>
      )}
      {message && <p className="mt-3 text-xs text-muted">{message}</p>}
    </section>
  );
}
