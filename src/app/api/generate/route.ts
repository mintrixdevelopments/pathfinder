import { auth } from "../../../auth";
import { NextResponse } from "next/server";

interface BuildAction {
  type: string;
  description: string;
}

interface GenerateResponse {
  id: string;
  prompt: string;
  message: string;
  actions: BuildAction[];
  status: "planned" | "chat";
}

function fallbackReply(prompt: string): { message: string; actions: BuildAction[] } {
  const lower = prompt.toLowerCase();
  const isGreeting = /^(hi|hey|hello|yo|sup|what's up|whats up)\b/.test(lower.trim());

  if (isGreeting) {
    return {
      message: "Hey, I'm Pathfinder. Tell me what to build in your Roblox game — a shop, a pet system, an entire game concept — and I'll break it down.",
      actions: [],
    };
  }

  const actions: BuildAction[] = [];
  if (lower.includes("shop") || lower.includes("store")) {
    actions.push({ type: "UI", description: "Shop interface with item listings" });
    actions.push({ type: "Script", description: "Purchase and currency deduction logic" });
  }
  if (lower.includes("pet")) {
    actions.push({ type: "Datastore", description: "Pet inventory datastore schema" });
    actions.push({ type: "Model", description: "Pet equip and follow behavior" });
  }
  if (lower.includes("npc")) {
    actions.push({ type: "Script", description: "NPC with dialogue or interaction trigger" });
  }
  if (lower.includes("leaderboard")) {
    actions.push({ type: "UI", description: "Leaderboard UI sorted by stat" });
    actions.push({ type: "Datastore", description: "Ordered datastore for ranking" });
  }
  if (actions.length === 0) {
    return {
      message: "I'm not sure what to build from that yet — try describing a specific feature or system.",
      actions: [],
    };
  }

  return { message: "On it. Breaking this into pieces:", actions };
}

async function generateWithGemini(
  prompt: string
): Promise<{ message: string; actions: BuildAction[] } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = `You are Pathfinder, an AI Roblox developer. You are talking directly to a developer in a chat interface.

Decide what this message needs:
- Greeting, small talk, or a question about you: reply warmly and briefly in first person, invite them to describe something to build. actions must be [].
- An actual build request: reply with ONE short first-person sentence confirming what you're doing (e.g. "On it, setting up the core systems:"), never say "here's the plan" or "here's a plan" verbatim. Then break the work into concrete build actions.

SCALE ACTION COUNT TO COMPLEXITY. This is critical:
- Trivial request (one small addition): 1-3 actions.
- Moderate feature (a shop, a leaderboard): 3-6 actions.
- A full game or complex system (e.g. "a realistic PVP shooter", "a simulator game"): 8-14 actions, covering every distinct system a senior Roblox developer would actually build: core mechanics/combat, movement/physics, environment/level design, UI/HUD, matchmaking or spawning, sound/feedback, progression/currency, and polish. Never compress a big request into a handful of vague bullets — go granular, the way a real dev would break down a sprint.

Respond ONLY with valid JSON, no markdown:
{"message": "one short first-person sentence", "actions": [{"type": "UI" | "Script" | "Datastore" | "Model", "description": "specific, concrete description"}]}

User message: ${prompt}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.message !== "string" || !Array.isArray(parsed.actions)) return null;

    return {
      message: parsed.message,
      actions: parsed.actions.filter(
        (a: unknown): a is BuildAction =>
          typeof a === "object" && a !== null && "type" in a && "description" in a
      ),
    };
  } catch (err) {
    console.error("Gemini request failed:", err);
    return null;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const prompt = body?.prompt;

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  let result = await generateWithGemini(prompt.trim());
  if (!result) {
    result = fallbackReply(prompt.trim());
  }

  const response: GenerateResponse = {
    id: `bld_${Date.now()}`,
    prompt: prompt.trim(),
    message: result.message,
    actions: result.actions,
    status: result.actions.length > 0 ? "planned" : "chat",
  };

  return NextResponse.json(response);
}
