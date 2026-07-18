import { NextResponse } from "next/server";
import { createPendingEmailUser, getUser } from "../../../../lib/accounts";
import { sendVerificationEmail } from "../../../../lib/email";
import { checkRateLimit, requestIp } from "../../../../lib/rate-limit";
import { isValidEmail, normalizeEmail, validatePassword } from "../../../../lib/security";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = normalizeEmail(typeof body?.email === "string" ? body.email : "");
  const password = typeof body?.password === "string" ? body.password : "";
  const inviteCode = typeof body?.inviteCode === "string" ? body.inviteCode.trim().toUpperCase() : "";

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: "Enter a name between 2 and 80 characters." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const ipLimit = await checkRateLimit(`register-ip:${requestIp(request)}`, 5, 60 * 60);
  const emailLimit = await checkRateLimit(`register-email:${email}`, 3, 60 * 60);
  if (!ipLimit.allowed || !emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.max(ipLimit.retryAfter, emailLimit.retryAfter)) } }
    );
  }

  try {
    const existing = await getUser(email);
    if (existing?.passwordHash && existing.emailVerified) {
      return NextResponse.json(
        { error: "An account already exists for this email. Sign in or reset your password." },
        { status: 409 }
      );
    }

    const { user, token } = await createPendingEmailUser({
      name,
      email,
      password,
      inviteCode: /^[A-Z0-9_-]{6,12}$/.test(inviteCode) ? inviteCode : undefined,
    });
    await sendVerificationEmail({ to: user.email, name: user.name, token });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Account registration failed", error);
    return NextResponse.json(
      { error: "We could not create your account right now. Please try again." },
      { status: 503 }
    );
  }
}
