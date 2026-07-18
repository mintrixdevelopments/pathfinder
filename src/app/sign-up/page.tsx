"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Logo } from "../../components/Logo";
import { GoogleIcon } from "../../components/GoogleIcon";

function SignUpContent() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const inviteCode = searchParams.get("ref")?.trim().toUpperCase() || "";

  useEffect(() => {
    if (inviteCode) window.localStorage.setItem("pf_pending_ref", inviteCode);
  }, [inviteCode]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, inviteCode }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Account could not be created.");
      setSent(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Account could not be created.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="inline-flex"><Logo height={42} priority /></Link>
          <div className="mt-8 rounded-2xl border border-neutral-200 p-8 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-xl font-semibold text-emerald-700">✓</div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">Check your inbox</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-500">We sent a verification link to <span className="font-medium text-neutral-800">{email}</span>. It expires in one hour.</p>
            <Link href="/sign-in" className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50">Return to sign in</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex"><Logo height={42} priority /></Link>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-neutral-950">Create your account</h1>
          <p className="mt-2 text-sm text-neutral-500">Start planning better Roblox experiences.</p>
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          {inviteCode && <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">Invite applied. Your friend receives their reward after you verify your account.</div>}

          <button
            type="button"
            disabled={googleLoading}
            onClick={async () => {
              setGoogleLoading(true);
              setError("");
              try {
                await signIn("google", { callbackUrl: "/dashboard" });
              } catch {
                setGoogleLoading(false);
                setError("Google sign-up could not start. Please try again.");
              }
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-60"
          >
            <GoogleIcon /> {googleLoading ? "Connecting to Google…" : "Continue with Google"}
          </button>

          <div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-neutral-200" /><span className="text-xs text-neutral-400">or use email</span><div className="h-px flex-1 bg-neutral-200" /></div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block"><span className="text-sm font-medium text-neutral-700">Name</span><input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100" /></label>
            <label className="block"><span className="text-sm font-medium text-neutral-700">Email</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100" placeholder="you@example.com" /></label>
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Password</span>
              <div className="relative mt-1.5"><input required minLength={10} maxLength={128} type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 pr-16 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-3 text-xs font-medium text-neutral-500">{showPassword ? "Hide" : "Show"}</button></div>
              <span className="mt-1.5 block text-xs text-neutral-400">Use at least 10 characters.</span>
            </label>
            <label className="block"><span className="text-sm font-medium text-neutral-700">Confirm password</span><input required type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100" /></label>

            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Creating account…" : "Create account"}</button>
          </form>

          <p className="mt-4 text-center text-[11px] leading-5 text-neutral-400">By creating an account, you agree to the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
          <p className="mt-4 text-center text-sm text-neutral-500">Already have an account? <Link href="/sign-in" className="font-medium text-neutral-900 hover:underline">Sign in</Link></p>
        </div>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return <Suspense fallback={<div className="min-h-screen bg-white" />}><SignUpContent /></Suspense>;
}
