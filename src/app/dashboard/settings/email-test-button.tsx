"use client";

import { useState } from "react";

export function EmailTestButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function sendTest() {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/account/test-email", { method: "POST" });
      const payload = await response.json().catch(() => null);
      setResult({
        ok: response.ok,
        message: response.ok ? payload?.message || "Test email sent." : payload?.error || "Test email failed.",
      });
    } catch {
      setResult({ ok: false, message: "Pathfinder could not reach the email service." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button disabled={loading} onClick={sendTest} className="rounded-lg border border-border px-3.5 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50">
        {loading ? "Sending test…" : "Send test security email"}
      </button>
      {result && <p className={`mt-2 text-xs font-medium ${result.ok ? "text-emerald-700" : "text-red-600"}`}>{result.message}</p>}
    </div>
  );
}
