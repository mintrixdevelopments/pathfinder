import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { createPluginPairingCode } from "../../../../../lib/plugin-pairing";
import { checkRateLimit } from "../../../../../lib/rate-limit";

export async function POST() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const limit = await checkRateLimit(`plugin-pair-start:${email}`, 10, 60 * 60);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many connection codes. Try again later." }, { status: 429 });
    }
    const result = await createPluginPairingCode(email);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Plugin pairing start failed", error);
    return NextResponse.json({ error: "A connection code could not be created." }, { status: 503 });
  }
}
