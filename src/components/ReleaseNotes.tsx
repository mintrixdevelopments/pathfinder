"use client";

import { useEffect, useState } from "react";

const releases = [
  {
    version: "0.3.2",
    label: "Current",
    date: "19 July 2026",
    author: "Mintrix Developments",
    title: "Reliable testing",
    description:
      "A focused reliability update making AI usage fairer and giving Mintrix a secure testing mode.",
    changes: [
      "Refunded generations automatically when a request is blocked or fails",
      "Improved failed-response presentation and removed irrelevant suggestions",
      "Added secure developer-code activation in account settings",
      "Added unlimited Pathfinder generation access for approved testing accounts",
      "Kept developer credentials server-side with attempt rate limiting",
    ],
  },
  {
    version: "0.3.1",
    label: "Intelligence",
    date: "19 July 2026",
    author: "Mintrix Developments",
    title: "Pathfinder intelligence",
    description:
      "A major intelligence and communication update giving complex Roblox work deeper engineering while keeping everyday requests fast.",
    changes: [
      "Added automatic Quick and Builder intelligence routing",
      "Added deeper Roblox architecture, scripting, data, and security planning",
      "Added clear generation costs before and after each request",
      "Added manual Quick and Builder controls when users want them",
      "Rebuilt every Pathfinder account email with embedded branding",
      "Improved new-device alerts and password session security",
    ],
  },
  {
    version: "0.3.0",
    label: "Accounts",
    date: "18 July 2026",
    author: "Mintrix Developments",
    title: "Pathfinder accounts",
    description:
      "A major reliability release making Pathfinder accounts, AI usage, referrals, and security clearer and more dependable.",
    changes: [
      "Added verified email and password accounts alongside Google",
      "Added secure password recovery and account security emails",
      "Added new-browser sign-in notifications",
      "Rebuilt referrals with reliable verified rewards",
      "Made AI generation costs predictable with automatic refunds",
      "Added separate daily and referral generation balances",
    ],
  },
  {
    version: "0.2.1",
    label: "Dashboard",
    date: "18 July 2026",
    author: "Mintrix Developments",
    title: "Production polish",
    description:
      "A focused update improving transparency, reliability, and the Pathfinder dashboard experience.",
    changes: [
      "Added an interactive release notes window",
      "Improved dashboard usability and navigation",
      "Improved production build reliability",
      "Prepared Pathfinder for expanded account support",
    ],
  },
  {
    version: "0.2.0",
    label: "Phase 2",
    date: "July 2026",
    author: "Mintrix Developments",
    title: "AI build planning",
    description:
      "Pathfinder can understand Roblox development requests and turn them into structured build plans.",
    changes: [
      "Added Gemini-powered build planning",
      "Added build complexity classification",
      "Added initiatives and build history",
      "Added Google authentication",
      "Added server-enforced usage limits",
      "Added invite and referral foundations",
    ],
  },
];

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path
        d="M12 3c.6 4.8 3.2 7.4 8 8-4.8.6-7.4 3.2-8 8-.6-4.8-3.2-7.4-8-8 4.8-.6 7.4-3.2 8-8Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="mt-0.5 h-4 w-4 shrink-0"
    >
      <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ReleaseNotes() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="dashboard-theme contents">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
        aria-label="View Pathfinder updates"
      >
        <SparkleIcon />
        <span>Updates</span>
        <span className="rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          0.3.2
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="release-notes-title"
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
          >
            <header className="flex shrink-0 items-start justify-between border-b border-neutral-200 px-6 py-5">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  <SparkleIcon />
                  Pathfinder releases
                </div>

                <h2
                  id="release-notes-title"
                  className="text-2xl font-semibold tracking-tight text-neutral-950"
                >
                  What is new
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Product changes and development progress.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                aria-label="Close release notes"
              >
                <CloseIcon />
              </button>
            </header>

            <div className="overflow-y-auto px-6 py-6">
              <div className="relative space-y-8 before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-neutral-200">
                {releases.map((release) => (
                  <article
                    key={release.version}
                    className="relative pl-8"
                  >
                    <span className="absolute left-0 top-2 h-[11px] w-[11px] rounded-full border-2 border-white bg-neutral-900 ring-1 ring-neutral-300" />

                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-neutral-950">
                        v{release.version}
                      </span>

                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-600">
                        {release.label}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-neutral-900">
                      {release.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {release.description}
                    </p>

                    <div className="mt-4 grid gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                          Released
                        </p>
                        <p className="mt-1 text-sm font-medium text-neutral-700">
                          {release.date}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                          Published by
                        </p>
                        <p className="mt-1 text-sm font-medium text-neutral-700">
                          {release.author}
                        </p>
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {release.changes.map((change) => (
                        <li
                          key={change}
                          className="flex items-start gap-2 text-sm text-neutral-700"
                        >
                          <CheckIcon />
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>

            <footer className="flex shrink-0 items-center justify-between border-t border-neutral-200 bg-neutral-50 px-6 py-4">
              <p className="text-xs text-neutral-500">
                Pathfinder is currently in alpha.
              </p>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
              >
                Done
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
