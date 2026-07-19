import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { getUser } from "../../../../lib/accounts";
import { sendSecurityTestEmail } from "../../../../lib/email";
import { checkRateLimit } from "../../../../lib/rate-limit";

export async function POST() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const limit = await checkRateLimit(`test-email:${email}`, 3, 60 * 60);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Test limit reached. Try again in one hour." }, { status: 429 });
    }

    const user = await getUser(email).catch(() => null);
    await sendSecurityTestEmail({ to: email, name: user?.name || session?.user?.name || "there" });
    return NextResponse.json({ ok: true, message: `Test email sent to ${email}.` });
  } catch (error) {
    console.error("Security email test failed", error);
    const detail = error instanceof Error && error.message.includes("RESEND_API_KEY")
      ? "Resend is not configured in Vercel production."
      : error instanceof Error && error.message.startsWith("Resend request failed")
        ? `Email provider error: ${error.message.slice(0, 260)}`
        : "Pathfinder could not reach the email service.";
    return NextResponse.json({ error: detail }, { status: 503 });
  }
}
