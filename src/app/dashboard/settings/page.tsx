"use client";

import { useUser, useClerk } from "@clerk/nextjs";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Account and workspace preferences.</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Account</h2>
        {isLoaded && user ? (
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Name</span>
              <span>{user.fullName || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Email</span>
              <span>{user.primaryEmailAddress?.emailAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Joined</span>
              <span>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted">Loading account…</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Workspace</h2>
        <p className="mt-1 text-xs text-muted">Mintrix Developments · Alpha</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Session</h2>
        <p className="mt-1 text-xs text-muted">Sign out of Pathfinder on this device.</p>
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
