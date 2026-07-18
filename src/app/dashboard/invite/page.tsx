"use client";

import { useEffect, useState } from "react";

interface InviteData {
  code: string;
  inviteCount: number;
  bonusCredits: number;
}

export default function InvitePage() {
  const [data, setData] = useState<InviteData | null>(null);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadInvite() {
      try {
        const response = await fetch("/api/invite", { cache: "no-store" });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.error || "Unable to load your invite link");
        }
        setData(payload);
        setLink(`${window.location.origin}/sign-up?ref=${encodeURIComponent(payload.code)}`);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load your invite link");
      }
    }

    loadInvite();
  }, []);

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Your browser blocked copying. Select the link and copy it manually.");
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Invite friends</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Each verified signup earns 2 bonus AI generations. Your tenth verified invite earns 5 extra.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <label className="text-xs font-medium text-muted-foreground">Your invite link</label>
        <div className="mt-2 flex gap-2">
          <input
            readOnly
            value={error ? "Invite link unavailable" : link}
            placeholder="Creating your invite link…"
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-neutral-700"
          />
          <button
            onClick={handleCopy}
            disabled={!link}
            className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <span className="text-3xl font-semibold tracking-tight">{data?.inviteCount ?? "—"}</span>
          <p className="mt-1 text-xs text-muted-foreground">Verified invites</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <span className="text-3xl font-semibold tracking-tight text-emerald-600">{data?.bonusCredits ?? "—"}</span>
          <p className="mt-1 text-xs text-muted-foreground">Bonus generations available</p>
        </div>
      </div>

      {data && data.inviteCount < 10 && (
        <p className="text-center text-xs text-muted-foreground">
          {10 - data.inviteCount} more verified invite{10 - data.inviteCount === 1 ? "" : "s"} until the 5-generation milestone bonus.
        </p>
      )}
    </div>
  );
}
