import { NextResponse } from "next/server";
import { createPasswordReset, getUser } from "../../../../lib/accounts";
import { sendPasswordResetEmail } from "../../../../lib/email";
import { checkRateLimit, requestIp } from "../../../../lib/rate-limit";
import { isValidEmail, normalizeEmail } from "../../../../lib/security";

const SUCCESS = "If a password account exists for that email, a reset link is on its way.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(typeof body?.email === "string" ? body.email : "");
  if (!isValidEmail(email)) return NextResponse.json({ message: SUCCESS });

  const limit = await checkRateLimit(`forgot:${requestIp(request)}:${email}`, 3, 60 * 60);
  if (!limit.allowed) return NextResponse.json({ message: SUCCESS });

  try {
    const [user, token] = await Promise.all([getUser(email), createPasswordReset(email)]);
    if (user && token) {
      await sendPasswordResetEmail({ to: user.email, name: user.name, token });
    }
  } catch (error) {
    console.error("Password reset request failed", error);
  }

  return NextResponse.json({ message: SUCCESS });
}
