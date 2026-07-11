import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const prompt = body.prompt;

  if (!prompt) {
    return NextResponse.json(
      { error: "No prompt provided" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Pathfinder received your request.",
    prompt,
    plan: [
      "Analyze request",
      "Create development plan",
      "Generate Roblox actions"
    ]
  });
}
