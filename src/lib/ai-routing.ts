export type AiModeSelection = "auto" | "quick" | "builder";
export type AiRoute = "local" | "quick" | "builder";

const QUICK_INTENT = /\b(idea|ideas|name|names|theme|themes|brainstorm|explain|summary|summarize|compare|which|what should|suggest|suggestion|feedback)\b/i;
const BUILDER_INTENT = /\b(build|create|implement|code|script|luau|lua|debug|fix|error|bug|architecture|system|mechanic|datastore|data store|memory\s*store|remote\s*event|remote\s*function|module\s*script|server\s*script|local\s*script|client|server|replication|security|exploit|inventory|leaderboard|matchmaking|combat|weapon|npc|pathfinding|procedural|save|loading|profile\s*service|ui|gui|hud|shop|pet|trading|quest|round system|admin)\b/i;
const MULTI_SYSTEM = /\b(and|with|plus|including)\b/i;
const LOCAL_CONVERSATION = /^(hi|hello|hey|hiya|heya|yo|sup|good morning|good afternoon|good evening|thanks|thank you|thankyou|ty|cheers|bye|goodbye|see you|cya|later|who are you|what are you|what can you do|help|help me|how are you|how('?s| is) it going|what('?s| is) up|wassup|nice|cool|awesome|great|okay|ok|alright|yes|yeah|yep|no|nope|idk|i don'?t know|not sure|dunno|no idea)$/i;
const LOCAL_PRODUCT_FACT = /who (made|created|built|developed|owns?) (you|pathfinder)|who('?s| is) behind pathfinder|who are your creators?|(?:who|what) (?:is|are) mintrix( developments)?|tell me about mintrix|what model|which model|are you gemini|are you google|did google (make|create|train) you|what is pathfinder|tell me about pathfinder|what can pathfinder do today/i;

export function isLocalPathfinderPrompt(prompt: string): boolean {
  const clean = prompt.trim().replace(/[!?.,]+$/g, "").trim();
  return LOCAL_CONVERSATION.test(clean) || LOCAL_PRODUCT_FACT.test(clean);
}

export function routeAiPrompt(prompt: string, requested: AiModeSelection = "auto"): Exclude<AiRoute, "local"> {
  if (requested === "quick" || requested === "builder") return requested;

  const clean = prompt.trim();
  if (BUILDER_INTENT.test(clean)) return "builder";
  if (clean.length >= 220 || (clean.length >= 110 && MULTI_SYSTEM.test(clean))) return "builder";
  if (QUICK_INTENT.test(clean)) return "quick";

  return "quick";
}

export function previewAiRoute(prompt: string, requested: AiModeSelection = "auto"): AiRoute {
  if (isLocalPathfinderPrompt(prompt)) return "local";
  return routeAiPrompt(prompt, requested);
}

export function generationCostForRoute(route: AiRoute): number {
  if (route === "builder") return 2;
  if (route === "quick") return 1;
  return 0;
}

export function routeLabel(route: AiRoute): string {
  if (route === "builder") return "Pathfinder Builder";
  if (route === "quick") return "Pathfinder Quick";
  return "Pathfinder Local";
}
