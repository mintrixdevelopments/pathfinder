"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function SignOutAllButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function revoke() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/account/sign-out-all", { method: "POST" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Could not sign out all devices.");
      await signOut({ callbackUrl: "/sign-in?signedOut=all" });
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Could not sign out all devices.");
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="mt-3 rounded-lg border border-red-200 px-3.5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50">
        Sign out all devices
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-900">Sign out everywhere?</p>
      <p className="mt-1 text-xs leading-5 text-red-700">Every Pathfinder session will be revoked, including this browser.</p>
      {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button disabled={loading} onClick={revoke} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">
          {loading ? "Signing out…" : "Yes, sign out everywhere"}
        </button>
        <button disabled={loading} onClick={() => setConfirming(false)} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100">
          Cancel
        </button>
      </div>
    </div>
  );
}
