import Link from "next/link";

export default function DonatePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-2xl text-center">
        <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500">
          Coming Soon
        </span>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-neutral-900">
          Support Pathfinder
        </h1>

        <p className="mt-5 text-lg leading-8 text-neutral-500">
          We're currently preparing our donation system. Due to the increasing
          costs of running advanced AI models and Pathfinder's infrastructure,
          donations are not available just yet.
        </p>

        <p className="mt-4 text-base leading-7 text-neutral-500">
          Every future contribution will go directly toward AI processing,
          server infrastructure, development, and future Pathfinder features.
          Thank you for supporting the project.
        </p>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
