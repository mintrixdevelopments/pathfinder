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
  suggestions: string[];
  status: "planned" | "chat";
}

const DEFAULT_SUGGESTIONS = [
  "Add a shop with rarities and a purchase UI",
  "Build a pet system with equip and follow behavior",
  "Create a PvP arena with weapon mechanics",
  "Add a leaderboard tracking player wins",
];

function fallbackReply(prompt: string): { message: string; actions: BuildAction[]; suggestions: string[] } {
  const lower = prompt.toLowerCase().trim();
  const isGreeting = /^(hi|hey|hello|yo|sup|what's up|whats up)\b/.test(lower);
  const isUnsure = /^(idk|i don't know|i dont know|not sure|dunno|anything|something|whatever|no idea|not sure yet)\b/.test(lower);

  if (isGreeting) {
    return {
      message: "Hey, I'm Pathfinder. Tell me what to build in your Roblox game and I'll break it down.",
      actions: [],
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  if (isUnsure || lower.length < 3) {
    return {
      message: "No worries — here are a few ideas to get started, or describe your own:",
      actions: [],
      suggestions: DEFAULT_SUGGESTIONS,
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
      message: "I'm not sure what to build from that yet — try one of these, or describe your own:",
      actions: [],
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  return { message: "On it. Breaking this into pieces:", actions, suggestions: [] };
}

async function generateWithGemini(
  prompt: string
): Promise<{ message: string; actions: BuildAction[]; suggestions: string[] } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = `You are Pathfinder, an AI Roblox developer. You are talking directly to a developer in a chat interface.

Classify the message into exactly one of these:

1. GREETING/SMALL TALK (e.g. "hi", "hello", "what can you do") — reply warmly and briefly in first person, invite them to describe something to build. actions: [], suggestions: 3-4 concrete example build ideas.

2. UNCLEAR/UNDECIDED (e.g. "idk", "not sure", "something cool", "surprise me", or anything too vague to act on) — acknowledge briefly, do NOT just say hello, and offer 3-4 concrete, specific build ideas as suggestions. actions: [].

3. ACTUAL BUILD REQUEST — reply with ONE short first-person sentence confirming what you're doing (never say "here's the plan" verbatim). Break the work into concrete build actions. SCALE COUNT TO COMPLEXITY: trivial = 1-3 actions, moderate (a shop, a leaderboard) = 3-6 actions, a full game or complex system (e.g. "realistic PVP shooter", "simulator game") = 8-14 actions covering every distinct system a real developer would build (mechanics, movement, environment, UI/HUD, spawning/matchmaking, sound, progression, polish). suggestions: [].

Respond ONLY with valid JSON, no markdown:
{"message": "short first-person reply", "actions": [{"type": "UI" | "Script" | "Datastore" | "Model", "description": "specific description"}], "suggestions": ["idea 1", "idea 2"]}

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
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 4) : [],
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
    suggestions: result.suggestions,
    status: result.actions.length > 0 ? "planned" : "chat",
  };

  return NextResponse.json(response);
}
