"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { Logo } from "../../components/Logo";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const verified = searchParams.get("verified") === "1";
  const reset = searchParams.get("reset") === "1";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Email or password is incorrect, or the email has not been verified.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Pathfinder could not sign you in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex"><Logo height={42} priority /></Link>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-neutral-950">Welcome back</h1>
          <p className="mt-2 text-sm text-neutral-500">Sign in to continue building with Pathfinder.</p>
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          {(verified || reset) && (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
              {verified ? "Email verified. Your Pathfinder account is ready." : "Password updated. Sign in with your new password."}
            </div>
          )}

          <a href="/api/auth/signin/google?callbackUrl=/dashboard" className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50">
            <GoogleIcon /> Continue with Google
          </a>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-400">or continue with email</span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Email</span>
              <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100" placeholder="you@example.com" />
            </label>

            <label className="block">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">Password</span>
                <Link href="/forgot-password" className="text-xs font-medium text-neutral-500 hover:text-neutral-900">Forgot password?</Link>
              </div>
              <div className="relative mt-1.5">
                <input type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 pr-16 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-3 text-xs font-medium text-neutral-500 hover:text-neutral-900">{showPassword ? "Hide" : "Show"}</button>
              </div>
            </label>

            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-neutral-500">
            New to Pathfinder? <Link href="/sign-up" className="font-medium text-neutral-900 hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return <Suspense fallback={<div className="min-h-screen bg-white" />}><SignInContent /></Suspense>;
}
