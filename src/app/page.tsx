import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Describe your build",
    description:
      "Tell Pathfinder what you want in plain English — a shop system, a pet inventory, a full simulator loop. No Lua required.",
  },
  {
    number: "02",
    title: "Pathfinder plans it",
    description:
      "The AI breaks your prompt into structured build actions — scripts, UI, datastores, NPCs — the same way a real developer would plan the work.",
  },
  {
    number: "03",
    title: "It builds itself",
    description:
      "The Pathfinder plugin executes those actions live inside Roblox Studio. Objects, scripts, and systems appear in your game automatically.",
  },
];

const FEATURES = [
  {
    title: "Natural language builds",
    description:
      "Skip the boilerplate. Describe what the feature should do and Pathfinder writes the systems behind it.",
  },
  {
    title: "Works inside Roblox Studio",
    description:
      "No copy-pasting code between windows. Pathfinder's plugin builds directly inside your actual project.",
  },
  {
    title: "Full systems, not snippets",
    description:
      "Datastores, UI, NPCs, shops — Pathfinder builds connected systems, not isolated scripts you have to wire together yourself.",
  },
  {
    title: "Built for iteration",
    description:
      "Keep refining with follow-up prompts. Pathfinder understands your project as it grows, not just a single request.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <span className="text-lg font-semibold tracking-tight">Pathfinder</span>
        <nav className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center px-6 pb-20 pt-16 text-center md:pt-24">
        <span className="mb-5 rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500">
          Alpha · Early access
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
          Your next Roblox game,
          <br />
          built by describing it.
        </h1>
        <p className="mt-5 max-w-lg text-base text-neutral-500">
          Pathfinder is an AI Roblox developer. Type what you want, and it
          plans, writes, and builds the systems directly inside Roblox
          Studio — scripts, UI, datastores, NPCs, and more.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/sign-up"
            className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Start building free
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-16 w-full max-w-xl rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-left">
          <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          </div>
          <p className="pt-3 text-sm text-neutral-500">
            "Build a modern simulator game with pets, UI, datastores, NPCs,
            and a shop."
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-neutral-100 bg-neutral-50/50 px-6 py-20 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-sm text-neutral-500">
              From prompt to playable, in three steps.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col">
                <span className="text-sm font-medium text-neutral-300">
                  {step.number}
                </span>
                <h3 className="mt-3 text-base font-semibold text-neutral-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Built for real Roblox development
            </h2>
            <p className="mt-3 text-sm text-neutral-500">
              Not another code generator. An AI that actually builds inside
              your project.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-neutral-200 p-5 transition-colors hover:border-neutral-300"
              >
                <h3 className="text-sm font-semibold text-neutral-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-neutral-100 px-6 py-20 text-center md:px-10">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Stop writing boilerplate. Start describing.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500">
          Pathfinder is in early access. Sign up now and be one of the first
          developers building with it.
        </p>
        <div className="mt-7">
          <Link
            href="/sign-up"
            className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Get early access
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-100 px-6 py-6 text-center text-xs text-neutral-400 md:px-10">
        Mintrix Developments
      </footer>
    </div>
  );
}
