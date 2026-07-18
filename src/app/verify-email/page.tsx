import Link from "next/link";
import { verifyEmailToken, saveUser } from "../../lib/accounts";
import { redeemInviteForEmail } from "../../lib/invites";
import { Logo } from "../../components/Logo";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const user = token ? await verifyEmailToken(token).catch(() => null) : null;

  if (user?.pendingInviteCode) {
    await redeemInviteForEmail(user.email, user.pendingInviteCode).catch(() => null);
    delete user.pendingInviteCode;
    await saveUser(user).catch(() => null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex"><Logo height={42} priority /></Link>
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl font-semibold ${user ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {user ? "✓" : "!"}
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-neutral-950">
            {user ? "Email verified" : "Link unavailable"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            {user
              ? "Your Pathfinder account is ready. You can now sign in with your email and password."
              : "This verification link is invalid, expired, or has already been used."}
          </p>
          <Link href={user ? "/sign-in?verified=1" : "/sign-up"} className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800">
            {user ? "Continue to sign in" : "Return to sign up"}
          </Link>
        </div>
      </div>
    </main>
  );
}
