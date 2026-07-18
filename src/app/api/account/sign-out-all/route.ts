import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { redisIncr } from "../../../../lib/redis";

export async function POST() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await redisIncr(`pf:session-version:${email}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Sign out all devices failed", error);
    return NextResponse.json({ error: "Could not sign out all devices." }, { status: 503 });
  }
}
