"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "../../components/Logo";

function ResetPasswordContent() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!token) return setError("This reset link is missing its security token.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const response = await fetch("/api/account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Password could not be reset.");
      router.push("/sign-in?reset=1");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Password could not be reset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex"><Logo height={42} priority /></Link>
        <div className="mt-8 rounded-2xl border border-neutral-200 p-7 text-left shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">Choose a new password</h1>
          <p className="mt-2 text-sm text-neutral-500">Use at least 10 characters that you do not reuse elsewhere.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block"><span className="text-sm font-medium text-neutral-700">New password</span><div className="relative mt-1.5"><input required minLength={10} maxLength={128} type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 pr-16 text-sm outline-none focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-3 text-xs font-medium text-neutral-500">{showPassword ? "Hide" : "Show"}</button></div></label>
            <label className="block"><span className="text-sm font-medium text-neutral-700">Confirm password</span><input required type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100" /></label>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
            <button disabled={loading} type="submit" className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50">{loading ? "Updating…" : "Update password"}</button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="min-h-screen bg-white" />}><ResetPasswordContent /></Suspense>;
}
