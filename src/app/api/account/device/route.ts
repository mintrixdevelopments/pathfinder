import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { getUser } from "../../../../lib/accounts";
import { sendNewDeviceEmail } from "../../../../lib/email";
import { redisDelete, redisExpire, redisSetNX } from "../../../../lib/redis";
import { digestValue } from "../../../../lib/security";

function readableDevice(userAgent: string): string {
  const browser = userAgent.includes("Edg/") ? "Edge" : userAgent.includes("Chrome/") ? "Chrome" : userAgent.includes("Firefox/") ? "Firefox" : userAgent.includes("Safari/") ? "Safari" : "Web browser";
  const system = userAgent.includes("Macintosh") ? "macOS" : userAgent.includes("Windows") ? "Windows" : userAgent.includes("Android") ? "Android" : /iPhone|iPad/.test(userAgent) ? "iOS" : "Unknown system";
  return `${browser} on ${system}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const deviceId = typeof body?.deviceId === "string" ? body.deviceId : "";
  if (!/^[a-zA-Z0-9_-]{20,100}$/.test(deviceId)) {
    return NextResponse.json({ error: "Invalid device identifier" }, { status: 400 });
  }

  const email = session.user.email.toLowerCase();
  const key = `pf:device:${email}:${digestValue(deviceId)}`;
  const created = await redisSetNX(key, new Date().toISOString());
  await redisExpire(key, 60 * 60 * 24 * 365);
  if (created !== 1) return NextResponse.json({ ok: true, newDevice: false });

  const user = await getUser(email).catch(() => null);
  const rawCity = request.headers.get("x-vercel-ip-city") || "Unknown city";
  const city = (() => { try { return decodeURIComponent(rawCity); } catch { return rawCity; } })();
  const country = request.headers.get("x-vercel-ip-country") || "Unknown country";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "Unavailable";
  const userAgent = request.headers.get("user-agent") || "Unknown browser";

  try {
    await sendNewDeviceEmail({
      to: email,
      name: user?.name || session.user.name || "there",
      device: readableDevice(userAgent),
      location: `${city}, ${country}`,
      ip,
      time: new Intl.DateTimeFormat("en-AU", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" }).format(new Date()) + " UTC",
    });
    return NextResponse.json({ ok: true, newDevice: true });
  } catch (error) {
    await redisDelete(key).catch(() => null);
    console.error("New device email failed", error);
    return NextResponse.json({ error: "Security notification could not be sent" }, { status: 503 });
  }
}
