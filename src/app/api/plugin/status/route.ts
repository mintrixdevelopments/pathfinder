import { NextResponse } from "next/server";
import { getPluginSession, updatePluginSession } from "../../../../lib/plugin-pairing";

export async function POST(request: Request) {
  const authenticated = await getPluginSession(request).catch(() => null);
  if (!authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const placeId = Number.isFinite(Number(body?.placeId)) ? Number(body.placeId) : 0;
  const gameId = Number.isFinite(Number(body?.gameId)) ? Number(body.gameId) : 0;
  const placeName = typeof body?.placeName === "string" ? body.placeName.trim().slice(0, 120) : "Untitled place";
  const updated = {
    ...authenticated.session,
    lastSeenAt: new Date().toISOString(),
    placeId,
    gameId,
    placeName,
  };
  await updatePluginSession(authenticated.token, updated);

  return NextResponse.json({
    connected: true,
    account: updated.email,
    place: { id: placeId, gameId, name: placeName },
    phase: "0.4.0-alpha.1",
  });
}
