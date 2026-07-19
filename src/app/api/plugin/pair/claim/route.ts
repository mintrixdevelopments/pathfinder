import { NextResponse } from "next/server";
import { claimPluginPairingCode } from "../../../../../lib/plugin-pairing";
import { checkRateLimit, requestIp } from "../../../../../lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  const installationId = typeof body?.installationId === "string" ? body.installationId.trim() : "";
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code) || !/^[A-Za-z0-9-]{16,80}$/.test(installationId)) {
    return NextResponse.json({ error: "Enter a valid connection code." }, { status: 400 });
  }

  const limit = await checkRateLimit(`plugin-pair-claim:${requestIp(request)}:${installationId}`, 10, 60 * 60);
  if (!limit.allowed) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  try {
    const result = await claimPluginPairingCode(code, installationId);
    if (!result) return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 403 });
    return NextResponse.json({
      token: result.token,
      account: result.session.email,
      connected: true,
    });
  } catch (error) {
    console.error("Plugin pairing claim failed", error);
    return NextResponse.json({ error: "Pathfinder could not connect Studio right now." }, { status: 503 });
  }
}
