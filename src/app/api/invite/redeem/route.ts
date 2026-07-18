import { auth } from "../../../../auth";
import { NextResponse } from "next/server";
import { redisGet, redisIncr, redisIncrByFloat, redisSetNX } from "../../../../lib/redis";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const email = session.user.email;

  const body = await request.json().catch(() => null);
  const code = body?.code;
  if (typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const normalizedCode = code.trim().toUpperCase();
  const ownerEmail = await redisGet(`pf:codeowner:${normalizedCode}`);
  if (!ownerEmail) {
    return NextResponse.json({ ok: false, message: "Invalid invite code" }, { status: 200 });
  }
  if (ownerEmail === email) {
    return NextResponse.json({ ok: false, message: "You can't redeem your own invite link" }, { status: 200 });
  }

  const setResult = await redisSetNX(`pf:redeemed:${email}`, "1");
  if (setResult !== 1) {
    return NextResponse.json({ ok: false, message: "Already redeemed" });
  }

  const newCount = await redisIncr(`pf:invitecount:${ownerEmail}`);
  await redisIncrByFloat(`pf:bonuscredits:${ownerEmail}`, 1);
  if (newCount === 10) {
    await redisIncrByFloat(`pf:bonuscredits:${ownerEmail}`, 1);
  }

  return NextResponse.json({ ok: true, message: "Invite applied — thanks for joining Pathfinder!" });
}
