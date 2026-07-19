import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import {
  activateDeveloperAccess,
  developerAccessConfigured,
  disableDeveloperAccess,
  hasDeveloperAccess,
} from "../../../../lib/developer-access";
import { checkRateLimit, requestIp } from "../../../../lib/rate-limit";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    configured: developerAccessConfigured(),
    active: await hasDeveloperAccess(email).catch(() => false),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const action = body?.action === "disable" ? "disable" : "activate";

  if (action === "disable") {
    await disableDeveloperAccess(email);
    return NextResponse.json({ active: false });
  }

  const code = typeof body?.code === "string" ? body.code : "";
  if (!developerAccessConfigured()) {
    return NextResponse.json(
      { error: "Developer access has not been configured for this deployment." },
      { status: 503 }
    );
  }
  if (code.length < 8 || code.length > 128) {
    return NextResponse.json({ error: "Enter a valid developer code." }, { status: 400 });
  }

  const limit = await checkRateLimit(`developer:${email}:${requestIp(request)}`, 5, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many developer-code attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const active = await activateDeveloperAccess(email, code);
  if (!active) {
    return NextResponse.json({ error: "That developer code is not valid." }, { status: 403 });
  }

  return NextResponse.json({ active: true });
}
