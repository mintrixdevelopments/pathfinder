import { auth } from "../../../auth";
import { SignOutButton } from "./sign-out-button";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Account and workspace preferences.</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Account</h2>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted">Name</span><span>{user?.name || "Not set"}</span></div>
          <div className="flex justify-between"><span className="text-muted">Email</span><span>{user?.email}</span></div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Workspace</h2>
        <p className="mt-1 text-xs text-muted">Mintrix Developments · Alpha</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Session</h2>
        <p className="mt-1 text-xs text-muted">Sign out of Pathfinder on this device.</p>
        <SignOutButton />
      </div>
    </div>
  );
}
