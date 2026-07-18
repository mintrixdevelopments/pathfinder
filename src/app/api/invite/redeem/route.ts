import { auth } from "../../../../auth";
import { NextResponse } from "next/server";
import { redeemInviteForEmail } from "../../../../lib/invites";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!/^[A-Z0-9_-]{6,12}$/.test(code)) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
  }

  const email = session.user.email.toLowerCase();

  try {
    return NextResponse.json(await redeemInviteForEmail(email, code));
  } catch (error) {
    if (error instanceof Error && error.message === "CODE_NOT_FOUND") {
      return NextResponse.json({ error: "Invite code not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "SELF_REFERRAL") {
      return NextResponse.json({ error: "You cannot redeem your own invite link" }, { status: 400 });
    }
    console.error("Invite redeem failed", error);
    return NextResponse.json(
      { error: "Invite could not be redeemed. It will be retried automatically." },
      { status: 503 }
    );
  }
}
