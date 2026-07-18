import { auth } from "../../../auth";
import { NextResponse } from "next/server";
import { redisGet, redisSet } from "../../../lib/redis";

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const email = session.user.email;

  let code = await redisGet(`pf:invitecode:${email}`);
  if (!code) {
    code = generateCode();
    await redisSet(`pf:invitecode:${email}`, code);
    await redisSet(`pf:codeowner:${code}`, email);
  }

  const inviteCountRaw = await redisGet(`pf:invitecount:${email}`);
  const bonusRaw = await redisGet(`pf:bonuscredits:${email}`);

  return NextResponse.json({
    code,
    inviteCount: inviteCountRaw ? parseInt(inviteCountRaw, 10) : 0,
    bonusCredits: bonusRaw ? parseFloat(bonusRaw) : 0,
  });
}
