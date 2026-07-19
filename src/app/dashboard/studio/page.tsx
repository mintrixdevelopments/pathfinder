"use client";

import { useEffect, useState } from "react";

interface PairingCode {
  code: string;
  expiresAt: number;
}

export default function StudioConnectionPage() {
  const [pairing, setPairing] = useState<PairingCode | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pairing) return;
    const update = () => setRemaining(Math.max(0, Math.ceil((pairing.expiresAt - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [pairing]);

  async function createCode() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/plugin/pair/start", { method: "POST" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "A connection code could not be created.");
      setPairing({ code: payload.code, expiresAt: Date.now() + payload.expiresIn * 1000 });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "A connection code could not be created.");
    } finally {
      setLoading(false);
    }
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <div>
        <div className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">Phase 3 · Alpha 1</div>
        <h1 className="text-xl font-semibold tracking-tight">Connect Roblox Studio</h1>
        <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">Pair the Pathfinder Studio plugin with this account. Connection codes work once and expire after ten minutes.</p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M8 3h8v5H8zM5 13h14v8H5zM12 8v5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div><h2 className="text-sm font-medium">Pathfinder for Studio</h2><p className="mt-1 text-xs text-muted">Open the plugin before generating your code.</p></div>
        </div>

        {pairing && remaining > 0 ? (
          <div className="mt-6 rounded-xl border border-border bg-background p-5 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Connection code</p>
            <p className="mt-3 font-mono text-4xl font-semibold tracking-[0.22em] text-foreground">{pairing.code}</p>
            <p className="mt-3 text-xs text-muted">Expires in {minutes}:{seconds}</p>
          </div>
        ) : (
          <button type="button" onClick={createCode} disabled={loading} className="mt-6 w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50">
            {loading ? "Creating secure code…" : pairing ? "Generate another code" : "Generate connection code"}
          </button>
        )}
        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Connect in three steps</h2>
        <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3"><span className="font-medium text-foreground">1.</span><span>Open Roblox Studio and press Pathfinder in the Plugins toolbar.</span></li>
          <li className="flex gap-3"><span className="font-medium text-foreground">2.</span><span>Generate a code above and enter it in the Studio panel.</span></li>
          <li className="flex gap-3"><span className="font-medium text-foreground">3.</span><span>Approve Roblox&apos;s one-time permission for pathfinderlabs.vercel.app.</span></li>
        </ol>
      </section>

      <p className="text-xs leading-5 text-muted">Alpha 1 connects your account and current place. Build execution remains disabled until the reviewed executor ships in the next Alpha.</p>
    </div>
  );
}
