"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { Logo } from "../../components/Logo";
import { GoogleIcon } from "../../components/GoogleIcon";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
                setError("Google sign-in could not start. Please try again.");
              }
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-60"
          >
            <GoogleIcon /> {googleLoading ? "Connecting to Google…" : "Continue with Google"}
          </button>

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
