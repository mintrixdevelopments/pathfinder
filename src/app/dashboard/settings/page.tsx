export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account and workspace preferences.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Account</h2>
        <p className="mt-1 text-xs text-muted">
          Authentication has not been set up yet. This section will let you
          manage your login and profile once accounts are enabled.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Workspace</h2>
        <p className="mt-1 text-xs text-muted">Mintrix Developments · Alpha</p>
      </div>
    </div>
  );
}
