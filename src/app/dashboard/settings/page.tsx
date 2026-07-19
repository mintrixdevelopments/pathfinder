import Link from "next/link";
import { auth } from "../../../auth";
import { getUser } from "../../../lib/accounts";
import { SignOutButton } from "./sign-out-button";
import { SignOutAllButton } from "./sign-out-all-button";
import { redisLRange } from "../../../lib/redis";
import { InternalAccess } from "./internal-access";
import { hasInternalAccess, internalAccessConfigured } from "../../../lib/internal-access";

interface SecurityEvent {
  id: string;
  type: "new_sign_in";
  signInType: string;
  device: string;
  location: string;
  ip: string;
  createdAt: string;
}

function Status({ active, children }: { active: boolean; children: React.ReactNode }) {
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>{children}</span>;
}

export default async function SettingsPage() {
  const session = await auth();
  const sessionUser = session?.user;
  const account = sessionUser?.email ? await getUser(sessionUser.email).catch(() => null) : null;
  const activity = sessionUser?.email
    ? (await redisLRange(`pf:security-events:${sessionUser.email.toLowerCase()}`, 0, 4).catch(() => []))
        .map((item) => { try { return JSON.parse(item) as SecurityEvent; } catch { return null; } })
        .filter((item): item is SecurityEvent => Boolean(item?.id && item?.createdAt))
    : [];
  const internalActive = sessionUser?.email
    ? await hasInternalAccess(sessionUser.email).catch(() => false)
    : false;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Account & security</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage how you access and protect your Pathfinder account.</p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <div><h2 className="text-sm font-medium">Profile</h2><p className="mt-1 text-xs text-muted">Visible only inside your signed-in Pathfinder workspace.</p></div>
          <Status active={account?.emailVerified ?? true}>Verified email</Status>
        </div>
        <dl className="mt-5 divide-y divide-border text-sm">
          <div className="flex justify-between gap-6 py-3"><dt className="text-muted">Name</dt><dd className="truncate text-right font-medium">{account?.name || sessionUser?.name || "Not set"}</dd></div>
          <div className="flex justify-between gap-6 py-3"><dt className="text-muted">Email</dt><dd className="truncate text-right font-medium">{account?.email || sessionUser?.email}</dd></div>
        </dl>
      </section>

      <InternalAccess active={internalActive} configured={internalAccessConfigured()} />

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Sign-in methods</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div><p className="text-sm font-medium">Google</p><p className="mt-0.5 text-xs text-muted">Sign in through your Google account.</p></div>
            <Status active={account?.googleConnected ?? true}>{account?.googleConnected === false ? "Not connected" : "Connected"}</Status>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div><p className="text-sm font-medium">Email and password</p><p className="mt-0.5 text-xs text-muted">A verified password for direct Pathfinder access.</p></div>
            {account?.passwordHash ? <Status active>Enabled</Status> : <Link href="/sign-up" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-neutral-50">Add password</Link>}
          </div>
        </div>
        {account?.passwordHash && <Link href="/forgot-password" className="mt-4 inline-flex text-xs font-medium text-neutral-600 underline underline-offset-4 hover:text-neutral-950">Change password securely</Link>}
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Sign-in alerts</h2>
        <p className="mt-1 text-xs leading-5 text-muted">Pathfinder emails you when a browser we have not seen before signs in.</p>
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Security notifications active</div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between"><h2 className="text-sm font-medium">Recent sign-ins</h2><span className="text-[11px] text-muted">Last 90 days</span></div>
        {activity.length === 0 ? (
          <p className="mt-3 text-xs text-muted">New sign-in activity will appear here.</p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {activity.map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-5 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{event.device}</p>
                  <p className="mt-1 truncate text-xs text-muted">{event.location} · {event.signInType}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted">{new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.createdAt))}</p>
                  <p className="mt-1 text-[11px] text-neutral-400">{event.ip}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Sessions</h2>
        <p className="mt-1 text-xs leading-5 text-muted">Sign out this browser, or immediately revoke every active Pathfinder session.</p>
        <div className="flex flex-wrap gap-2"><SignOutButton /><SignOutAllButton /></div>
      </section>
    </div>
  );
}
