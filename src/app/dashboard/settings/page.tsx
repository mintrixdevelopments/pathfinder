import Link from "next/link";
import { auth } from "../../../auth";
import { getUser } from "../../../lib/accounts";
import { SignOutButton } from "./sign-out-button";

function Status({ active, children }: { active: boolean; children: React.ReactNode }) {
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>{children}</span>;
}

export default async function SettingsPage() {
  const session = await auth();
  const sessionUser = session?.user;
  const account = sessionUser?.email ? await getUser(sessionUser.email).catch(() => null) : null;

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
        <p className="mt-1 text-xs leading-5 text-muted">Pathfinder emails you when a browser we have not seen before signs in. Location information is approximate.</p>
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Security notifications active</div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Current session</h2>
        <p className="mt-1 text-xs text-muted">Sign out of Pathfinder on this browser.</p>
        <SignOutButton />
      </section>
    </div>
  );
}
