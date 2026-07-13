import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-neutral-900">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">&larr; Back to Pathfinder</Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated {new Date().toLocaleDateString()}</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-neutral-700">
        <p>
          By using Pathfinder, you agree to these terms. Pathfinder is built and
          operated by Mintrix Developments.
        </p>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">Early access / alpha status</h2>
          <p className="mt-2">
            Pathfinder is in active early-stage development. Features may change,
            break, or be removed without notice. Generated build plans and
            in-Studio actions are provided "as is," without warranty of any kind.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">Your account</h2>
          <p className="mt-2">
            You're responsible for the activity that happens under your account.
            Don't share your login credentials or attempt to access another
            user's account or project data.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">Acceptable use</h2>
          <p className="mt-2">
            You agree not to use Pathfinder to generate content that violates
            Roblox's Community Standards, to attempt to abuse or overload our
            systems, or to reverse-engineer the service.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">Your content</h2>
          <p className="mt-2">
            You retain ownership of the Roblox projects and content you build
            using Pathfinder. We claim no ownership over your game or its assets.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">Limitation of liability</h2>
          <p className="mt-2">
            Pathfinder is provided by a small independent team. To the extent
            permitted by law, we aren't liable for indirect or consequential
            damages arising from use of the service, including issues in
            generated code or Studio actions.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">Contact</h2>
          <p className="mt-2">
            Questions about these terms? Reach out at{" "}
            <a href="mailto:hello@pathfinder.dev" className="text-neutral-900 underline">
              hello@pathfinder.dev
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
