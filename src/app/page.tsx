import Link from "next/link";
import { auth } from "../auth";
import { Logo } from "../components/Logo";

const STEPS = [
  { number: "01", title: "Say what you want", description: "\"Add a pet shop with rarities and a leaderboard.\" Type it like you'd say it to a teammate — no code needed." },
  { number: "02", title: "Pathfinder figures out the rest", description: "It plans the systems, scripts, and UI needed to actually make that work, the way a developer would think it through." },
  { number: "03", title: "Watch it appear in Studio", description: "The plugin builds it live, inside your real project. Open Roblox Studio and it's already there." },
];

const FEATURES = [
  { title: "Talk to it like a person", description: "No prompt engineering, no special syntax. Describe the feature the way you'd explain it to a friend." },
  { title: "Lives inside Roblox Studio", description: "Nothing to copy or paste. Pathfinder builds directly in your open project, in real time." },
  { title: "Whole systems, not fragments", description: "Ask for a shop and you get the shop, the UI, the data saving, and the NPC that runs it — all connected." },
  { title: "Remembers your project", description: "Keep asking for more. Pathfinder understands what you've already built and adds to it, instead of starting over." },
];

const FOOTER_LINKS = {
  Product: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
  ],
  Company: [
    { label: "Mintrix Developments", href: "#" },
    { label: "Donate", href: "/donate" },
    { label: "Contact", href: "mailto:hello@pathfinder.dev" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const SOCIALS = [
  { label: "X", href: "https://x.com" },
  { label: "Discord", href: "https://discord.com" },
  { label: "GitHub", href: "https://github.com/mintrixdevelopments" },
];

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-white text-neutral-900">
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link href="/"><Logo height={36} /></Link>
        <nav className="flex items-center gap-3">
          <Link href="/donate" className="hidden text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 sm:block">
            Donate
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:bg-neutral-800 active:scale-[0.97]">
                Go to dashboard
              </Link>
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="h-8 w-8 rounded-full border border-neutral-200" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white">
                  {(session?.user?.name || session?.user?.email || "U").slice(0, 2).toUpperCase()}
                </div>
              )}
            </>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">
                Sign in
              </Link>
              <Link href="/sign-in" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:bg-neutral-800 active:scale-[0.97]">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="relative flex flex-col items-center overflow-hidden px-6 pb-20 pt-16 text-center md:pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="animate-float absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-indigo-100 opacity-50 blur-3xl" />
          <div className="animate-float-slow absolute top-10 right-1/4 h-80 w-80 rounded-full bg-neutral-100 opacity-60 blur-3xl" />
          <div className="animate-float absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-blue-50 opacity-50 blur-3xl" />
        </div>

        <span className="animate-fade-in-up mb-5 rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500">
          Alpha · Early access
        </span>
        <h1 className="animate-fade-in-up max-w-2xl text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl" style={{ animationDelay: "0.08s" }}>
          Your next Roblox game,
          <br />
          <span className="text-gradient">built by describing it.</span>
        </h1>
        <p className="animate-fade-in-up mt-5 max-w-lg text-base text-neutral-500" style={{ animationDelay: "0.16s" }}>
          Pathfinder is an AI Roblox developer. Tell it what you want, and it builds the systems directly inside Roblox Studio — scripts, UI, datastores, NPCs, and more.
        </p>
        <div className="animate-fade-in-up mt-8 flex items-center gap-3" style={{ animationDelay: "0.24s" }}>
          <Link href={isLoggedIn ? "/dashboard" : "/sign-in"} className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:bg-neutral-800 active:scale-[0.97]">
            {isLoggedIn ? "Go to dashboard" : "Start building free"}
          </Link>
        </div>

        <div className="animate-fade-in-up mt-16 w-full max-w-xl rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg" style={{ animationDelay: "0.32s" }}>
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
              <div key={step.number} className="flex flex-col transition-transform hover:-translate-y-1">
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
              <div key={feature.title} className="rounded-xl border border-neutral-200 p-5 transition-all hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md">
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
          <Link href={isLoggedIn ? "/dashboard" : "/sign-in"} className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:bg-neutral-800 active:scale-[0.97]">
            {isLoggedIn ? "Go to dashboard" : "Get early access"}
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-100 px-6 py-14 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col gap-3">
            <Logo height={22} />
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
