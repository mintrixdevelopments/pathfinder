import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { getUser } from "../../../../lib/accounts";
import {
  sendNewDeviceEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendSecurityTestEmail,
  sendVerificationEmail,
} from "../../../../lib/email";
import { hasInternalAccess } from "../../../../lib/internal-access";
import { checkRateLimit } from "../../../../lib/rate-limit";

type TestEmailType = "delivery" | "new-sign-in" | "verification" | "password-reset" | "password-changed";

const TEST_TYPES = new Set<TestEmailType>([
  "delivery",
  "new-sign-in",
  "verification",
  "password-reset",
  "password-changed",
]);

export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await hasInternalAccess(email).catch(() => false))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => null);
    const type = typeof body?.type === "string" && TEST_TYPES.has(body.type as TestEmailType)
      ? body.type as TestEmailType
      : "delivery";
    const limit = await checkRateLimit(`internal-email-test:${email}`, 12, 60 * 60);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Test limit reached. Try again in one hour." }, { status: 429 });
    }

    const user = await getUser(email).catch(() => null);
    const name = user?.name || session?.user?.name || "there";
    if (type === "new-sign-in") {
      await sendNewDeviceEmail({
        to: email,
        name,
        signInType: "Email and password",
        device: "macOS · Safari",
        location: "Sydney, Australia",
        ip: "203.0.113.42",
        time: new Intl.DateTimeFormat("en-AU", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" }).format(new Date()) + " UTC",
      });
    } else if (type === "verification") {
      await sendVerificationEmail({ to: email, name, token: "internal-template-preview" });
    } else if (type === "password-reset") {
      await sendPasswordResetEmail({ to: email, name, token: "internal-template-preview" });
    } else if (type === "password-changed") {
      await sendPasswordChangedEmail({ to: email, name });
    } else {
      await sendSecurityTestEmail({ to: email, name });
    }
    return NextResponse.json({ ok: true, message: `${type.replaceAll("-", " ")} email sent.` });
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
