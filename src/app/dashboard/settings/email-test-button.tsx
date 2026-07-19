"use client";

import { useState } from "react";

const EMAIL_TESTS = [
  { type: "new-sign-in", label: "New sign-in" },
  { type: "verification", label: "Verification" },
  { type: "password-reset", label: "Password reset" },
  { type: "password-changed", label: "Password changed" },
  { type: "delivery", label: "Delivery check" },
] as const;

export function EmailTestButton() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function sendTest(type: typeof EMAIL_TESTS[number]["type"]) {
    setLoading(type);
    setResult(null);
    try {
      const response = await fetch("/api/account/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const payload = await response.json().catch(() => null);
      setResult({
        ok: response.ok,
        message: response.ok ? payload?.message || "Test email sent." : payload?.error || "Test email failed.",
      });
    } catch {
      setResult({ ok: false, message: "Pathfinder could not reach the email service." });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-5 border-t border-border pt-5">
      <p className="text-xs font-medium text-foreground">Email templates</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {EMAIL_TESTS.map((test) => (
          <button key={test.type} type="button" disabled={loading !== null} onClick={() => sendTest(test.type)} className="rounded-lg border border-border px-3.5 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50">
            {loading === test.type ? "Sending…" : test.label}
          </button>
        ))}
      </div>
      {result && <p className={`mt-2 text-xs font-medium ${result.ok ? "text-emerald-700" : "text-red-600"}`}>{result.message}</p>}
    </div>
  );
}
