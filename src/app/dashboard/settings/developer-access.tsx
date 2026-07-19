"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeveloperAccess({ active, configured }: { active: boolean; configured: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [enabled, setEnabled] = useState(active);

  async function update(action: "activate" | "disable") {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/account/developer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "activate" ? { action, code } : { action }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Developer access could not be updated.");

      const nextEnabled = payload.active === true;
      setEnabled(nextEnabled);
      setCode("");
      setMessage({
        text: nextEnabled ? "Developer access enabled. Pathfinder generation limits are bypassed for this account." : "Developer access disabled.",
        ok: true,
      });
      router.refresh();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Developer access could not be updated.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">Developer access</h2>
          <p className="mt-1 max-w-lg text-xs leading-5 text-muted">For Mintrix testing accounts. Developer access removes Pathfinder&apos;s generation balance and shared Alpha cap; Google API project limits still apply.</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${enabled ? "bg-violet-100 text-violet-700" : "bg-neutral-100 text-neutral-500"}`}>
          {enabled ? "Active" : "Locked"}
        </span>
      </div>

      {enabled ? (
        <button
          type="button"
          onClick={() => update("disable")}
          disabled={loading}
          className="mt-4 rounded-lg border border-border px-3.5 py-2 text-xs font-medium text-foreground transition hover:bg-neutral-50 disabled:opacity-50"
        >
          {loading ? "Disabling…" : "Disable developer access"}
        </button>
      ) : (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter" && code) update("activate"); }}
            disabled={loading || !configured}
            autoComplete="off"
            placeholder={configured ? "Enter developer code" : "Developer code is not configured"}
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => update("activate")}
            disabled={loading || !configured || !code}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Checking…" : "Unlock"}
          </button>
        </div>
      )}

      {message && <p className={`mt-3 text-xs ${message.ok ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>}
    </section>
  );
}
