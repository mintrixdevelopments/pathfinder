import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-neutral-900">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">&larr; Back to Pathfinder</Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated {new Date().toLocaleDateString()}</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-neutral-700">
        <p>
          Pathfinder ("we," "our," or "us") is built by Mintrix Developments. This
          policy explains what information we collect when you use Pathfinder and
          how we use it.
        </p>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">Information we collect</h2>
          <p className="mt-2">
            When you sign in with Google, we receive your name, email address, and
            profile picture from Google. We use this only to identify your account
            and personalize your dashboard.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">Build prompts</h2>
          <p className="mt-2">
            Prompts you submit to Pathfinder are processed to generate build plans
            for your Roblox projects. We do not sell this data or share it with
            third parties for advertising.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">Data storage</h2>
          <p className="mt-2">
            Pathfinder is currently in early alpha. Account and session data is
            processed via our authentication provider. As we add persistent
            project storage, this policy will be updated to reflect exactly what
            is stored and for how long.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">Your rights</h2>
          <p className="mt-2">
            You can request deletion of your account and associated data at any
            time by contacting us at{" "}
            <a href="mailto:hello@pathfinder.dev" className="text-neutral-900 underline">
              hello@pathfinder.dev
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">Changes to this policy</h2>
          <p className="mt-2">
            As Pathfinder grows out of alpha, this policy will be updated. We'll
            note the "last updated" date above whenever changes are made.
          </p>
        </div>
      </div>
    </div>
  );
}
