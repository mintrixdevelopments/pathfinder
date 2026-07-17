"use client";

import { useState, useEffect } from "react";

interface InviteData {
  code: string;
  inviteCount: number;
  bonusCredits: number;
}

export default function InvitePage() {
  const [data, setData] = useState<InviteData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/invite")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const link = data ? `${window.location.origin}/sign-up?ref=${data.code}` : "";

  function handleCopy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Invite friends</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every friend who signs up with your link gives you +1 credit. Reach 10 invites for a +1 bonus.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <label className="text-xs font-medium text-muted-foreground">Your invite link</label>
        <div className="mt-2 flex gap-2">
          <input readOnly value={link} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-neutral-700" />
          <button onClick={handleCopy} className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <span className="text-3xl font-semibold tracking-tight">{data?.inviteCount ?? "—"}</span>
          <p className="mt-1 text-xs text-muted-foreground">Friends invited</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <span className="text-3xl font-semibold tracking-tight text-emerald-600">{data?.bonusCredits ?? "—"}</span>
          <p className="mt-1 text-xs text-muted-foreground">Bonus credits earned</p>
        </div>
      </div>

      {data && data.inviteCount < 10 && (
        <p className="text-center text-xs text-muted-foreground">
          {10 - data.inviteCount} more invite{10 - data.inviteCount === 1 ? "" : "s"} until your +1 bonus credit.
        </p>
      )}
    </div>
  );
}
