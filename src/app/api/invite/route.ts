import { randomBytes } from "node:crypto";
import { auth } from "../../../auth";
import { NextResponse } from "next/server";
import { redisGet, redisSet, redisSetNX } from "../../../lib/redis";

function generateCode(): string {
  return randomBytes(6).toString("base64url").slice(0, 8).toUpperCase();
}

async function getOrCreateCode(email: string): Promise<string> {
  const existing = await redisGet(`pf:invitecode:${email}`);
  if (existing) {
    const owner = await redisGet(`pf:codeowner:${existing}`);
    if (!owner || owner === email) {
      await redisSet(`pf:codeowner:${existing}`, email);
      return existing;
    }
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateCode();
    const claimed = await redisSetNX(`pf:codeowner:${code}`, email);
    if (claimed === 1) {
      await redisSet(`pf:invitecode:${email}`, code);
      return code;
    }
  }

  throw new Error("Unable to allocate a unique invite code");
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();

  try {
    const code = await getOrCreateCode(email);
    const [inviteCountRaw, bonusRaw] = await Promise.all([
      redisGet(`pf:invitecount:${email}`),
      redisGet(`pf:bonuscredits:${email}`),
    ]);

    return NextResponse.json(
      {
        code,
        inviteCount: Math.max(0, Number.parseInt(inviteCountRaw || "0", 10) || 0),
        bonusCredits: Math.max(0, Number.parseInt(bonusRaw || "0", 10) || 0),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Invite GET failed", error);
    return NextResponse.json(
      { error: "Invite service is temporarily unavailable" },
      { status: 503 }
    );
  }
}

