import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import {
  activateInternalAccess,
  disableInternalAccess,
  internalAccessConfigured,
} from "../../../../lib/internal-access";
import { checkRateLimit, requestIp } from "../../../../lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const action = body?.action === "disable" ? "disable" : "activate";

  if (action === "disable") {
    await disableInternalAccess(email);
    return NextResponse.json({ active: false });
  }

  const key = typeof body?.key === "string" ? body.key : "";
  if (!internalAccessConfigured()) {
    return NextResponse.json({ error: "Access is unavailable." }, { status: 404 });
  }
  if (key.length < 12 || key.length > 128) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const limit = await checkRateLimit(`internal-access:${email}:${requestIp(request)}`, 5, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const active = await activateInternalAccess(email, key);
  if (!active) return NextResponse.json({ error: "Access denied." }, { status: 403 });
  return NextResponse.json({ active: true });
}
