import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

const STEPS = [
  { number: "01", title: "Say what you want", description: "\"Add a pet shop with rarities and a leaderboard.\" Type it like you'd say it to a teammate — no code needed." },
  { number: "02", title: "Pathfinder figures out the rest", description: "It plans the systems, scripts, and UI needed to actually make that work, the way a developer would think it through." },
  { number: "03", title: "Watch it appear in Studio", description: "The plugin builds it live, inside your real project. Open Roblox Studio and it's already there." },
];

const FEATURES = [
  { title: "Talk to it like a person", description: "No prompt engineering, no special syntax. Describe the feature the way you'd explain it to a friend." },
  { title: "Lives inside Roblox Studio", description: "Nothing to copy or paste. Pathfinder builds directly in your open project, in real time." },
  { title: "Whole features, not fragments", description: "Ask for a shop and you get the shop, the UI, the data saving, and the NPC that runs it — all connected." },
  { title: "Remembers your project", description: "Keep asking for more. Pathfinder understands what you've already built and adds to it, instead of starting over." },
];

const FOOTER_LINKS = {
  Product: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
  ],
  Company: [
    { label: "Mintrix Developments", href: "#" },
    { label: "Contact", href: "mailto:hello@pathfinder.dev" },
  ],
};

const SOCIALS = [
  { label: "X", href: "https://x.com" },
  { label: "Discord", href: "https://discord.com" },
  { label: "GitHub", href: "https://github.com/mintrixdevelopments" },
];

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <span className="text-lg font-semibold tracking-tight">Pathfinder</span>
        <nav className="flex items-center gap-3">
          {userId ? (
            <>
              <Link href="/dashboard" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
                Go to dashboard
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    userButtonPopoverFooter: "hidden",
                  },
                }}
              />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">
                Sign in
              </Link>
              <Link href="/sign-up" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

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
          Pathfinder is an AI Roblox developer. Tell it what you want, and it builds the systems directly inside Roblox Studio — scripts, UI, datastores, NPCs, and more.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link href={userId ? "/dashboard" : "/sign-up"} className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
            {userId ? "Go to dashboard" : "Start building free"}
          </Link>
          {!userId && (
            <Link href="/sign-in" className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50">
              Sign in
            </Link>
          )}
        </div>

        <div className="mt-16 w-full max-w-xl rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-left">
          <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          </div>
          <p className="pt-3 text-sm text-neutral-500">
            "Build a modern simulator game with pets, UI, datastores, NPCs, and a shop."
          </p>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-neutral-100 bg-neutral-50/50 px-6 py-20 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How it works</h2>
            <p className="mt-3 text-sm text-neutral-500">From idea to playable, in three steps.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col">
                <span className="text-sm font-medium text-neutral-300">{step.number}</span>
                <h3 className="mt-3 text-base font-semibold text-neutral-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Built for real Roblox development</h2>
            <p className="mt-3 text-sm text-neutral-500">Not another code generator. An AI that actually builds inside your project.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-neutral-200 p-5 transition-colors hover:border-neutral-300">
                <h3 className="text-sm font-semibold text-neutral-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-100 px-6 py-20 text-center md:px-10">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Stop scripting the same systems over and over.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500">Pathfinder is in early access. Sign up now and be one of the first developers building with it.</p>
        <div className="mt-7">
          <Link href={userId ? "/dashboard" : "/sign-up"} className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
            {userId ? "Go to dashboard" : "Get early access"}
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-100 px-6 py-14 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col gap-3">
            <span className="text-base font-semibold tracking-tight">Pathfinder</span>
            <p className="max-w-xs text-sm text-neutral-500">An AI Roblox developer, built by Mintrix Developments.</p>
            <div className="mt-2 flex items-center gap-4">
              {SOCIALS.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-400 transition-colors hover:text-neutral-900">
                  {social.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex gap-16">
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section} className="flex flex-col gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">{section}</span>
                {links.map((link) => (
                  <Link key={link.label} href={link.href} className="text-sm text-neutral-600 transition-colors hover:text-neutral-900">
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-5xl border-t border-neutral-100 pt-6 text-xs text-neutral-400">
          © {new Date().getFullYear()} Mintrix Developments. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
