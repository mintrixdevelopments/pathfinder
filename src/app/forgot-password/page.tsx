"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "../../components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/account/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      setMessage(payload.message || "If an account exists, a reset link is on its way.");
    } catch {
      setMessage("If an account exists, a reset link is on its way.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex"><Logo height={42} priority /></Link>
        <div className="mt-8 rounded-2xl border border-neutral-200 p-7 text-left shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">Reset your password</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">Enter your account email and Pathfinder will send a secure, single-use reset link.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block"><span className="text-sm font-medium text-neutral-700">Email</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100" placeholder="you@example.com" /></label>
            {message && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-5 text-emerald-800">{message}</p>}
            <button disabled={loading} type="submit" className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50">{loading ? "Sending…" : "Send reset link"}</button>
          </form>
          <Link href="/sign-in" className="mt-5 block text-center text-sm font-medium text-neutral-600 hover:text-neutral-950">Back to sign in</Link>
        </div>
      </div>
    </main>
  );
}
