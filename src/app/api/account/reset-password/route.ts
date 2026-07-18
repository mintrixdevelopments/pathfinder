import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "../../../../lib/accounts";
import { sendPasswordChangedEmail } from "../../../../lib/email";
import { redisIncr } from "../../../../lib/redis";
import { checkRateLimit, requestIp } from "../../../../lib/rate-limit";
import { validatePassword } from "../../../../lib/security";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const passwordError = validatePassword(password);
  if (!token || passwordError) {
    return NextResponse.json({ error: passwordError || "Invalid reset link." }, { status: 400 });
  }

  const limit = await checkRateLimit(`reset:${requestIp(request)}`, 10, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  try {
    const user = await resetPasswordWithToken(token, password);
    if (!user) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }
    await redisIncr(`pf:session-version:${user.email.toLowerCase()}`);
    await sendPasswordChangedEmail({ to: user.email, name: user.name }).catch((error) => {
      console.error("Password changed email failed", error);
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Password reset failed", error);
    return NextResponse.json({ error: "Password could not be reset right now." }, { status: 503 });
  }
}
