export type AiModeSelection = "auto" | "quick" | "builder";
export type AiRoute = "local" | "quick" | "builder";
export type LocalConversationKind =
  | "greeting"
  | "thanks"
  | "goodbye"
  | "identity"
  | "creator"
  | "mintrium"
  | "model"
  | "product"
  | "acknowledgement"
  | "uncertain"
  | "presence"
  | "small-talk"
  | "unsupported";

const QUICK_INTENT = /\b(idea|ideas|name|names|theme|themes|brainstorm|explain|summary|summarize|compare|which|what should|suggest|suggestion|feedback)\b/i;
const BUILDER_INTENT = /\b(build|create|implement|code|script|luau|lua|debug|fix|error|bug|architecture|system|mechanic|datastore|data store|memory\s*store|remote\s*event|remote\s*function|module\s*script|server\s*script|local\s*script|client|server|replication|security|exploit|inventory|leaderboard|matchmaking|combat|weapon|npc|pathfinding|procedural|save|loading|profile\s*service|ui|gui|hud|shop|pet|trading|quest|round system|admin)\b/i;
const MULTI_SYSTEM = /\b(and|with|plus|including)\b/i;
const GREETING = /^(?:(?:hi|hello|hey|hiya|heya|yo|sup|howdy)(?:\s+(?:there|pathfinder|friend|again))?|good\s+(?:morning|afternoon|evening))(?:\s*[,—-]?\s*(?:how are you|how'?s it going|what'?s up))?$/i;
const THANKS = /^(?:thanks|thank you|thankyou|ty|cheers)(?:\s+(?:pathfinder|so much|a lot|for (?:that|the help|your help)|that helped|that was helpful))?$/i;
const GOODBYE = /^(?:bye|goodbye|see you|see ya|cya|later|talk to you later|gotta go|have a good (?:day|night))$/i;
const IDENTITY = /^(?:who are you|what are you|what can you do|how can you help(?: me)?|help|help me|what should i ask(?: you)?)$/i;
const CREATOR = /who (?:made|created|built|developed|owns?) (?:you|pathfinder)|who(?:'s| is) behind pathfinder|who are your creators?/i;
const MINTRIUM = /(?:who|what) (?:is|are) (?:mintrium|mintrix)(?: developments)?|tell me about (?:mintrium|mintrix)/i;
const MODEL = /what model|which model|are you gemini|are you google|did google (?:make|create|train) you|what ai (?:are you|do you use)/i;
const PRODUCT = /what is pathfinder|tell me about pathfinder|what(?:'s| is) pathfinder(?:'s)? (?:purpose|goal|mission)|what can pathfinder do today|is pathfinder (?:free|finished|available)/i;
const ACKNOWLEDGEMENT = /^(?:nice|cool|awesome|great|perfect|okay|ok|alright|yes|yeah|yep|sure|sounds good|got it|understood|makes sense|no|nope)(?:\s+(?:thanks|then|pathfinder))?$/i;
const UNCERTAIN = /^(?:idk|i don'?t know|not sure|dunno|no idea|what should i build|give me somewhere to start)$/i;
const PRESENCE = /^(?:are you there|are you online|can you hear me|are you working|hello\s+are you there|test|testing)$/i;
const SMALL_TALK = /^(?:how are you(?: doing)?|how(?:'s| is) it going|what(?:'s| is) up|wassup|how(?:'s| is) your day|are you ready|i(?:'m| am) (?:back|bored)|tell me a joke)$/i;
const UNSUPPORTED = /^(?:what(?:'s| is) the weather|tell me the weather|what time is it|what(?:'s| is) today(?:'s)? date|write me an essay|do my homework)$/i;

export function localConversationKind(prompt: string): LocalConversationKind | null {
  const clean = prompt
    .trim()
    .toLowerCase()
    .replace(/[!?.,]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean || clean.length > 180) return null;
  if (CREATOR.test(clean)) return "creator";
  if (MINTRIUM.test(clean)) return "mintrium";
  if (MODEL.test(clean)) return "model";
  if (PRODUCT.test(clean)) return "product";
  if (BUILDER_INTENT.test(clean) || QUICK_INTENT.test(clean)) return null;
  if (GREETING.test(clean)) return "greeting";
  if (THANKS.test(clean)) return "thanks";
  if (GOODBYE.test(clean)) return "goodbye";
  if (IDENTITY.test(clean)) return "identity";
  if (ACKNOWLEDGEMENT.test(clean)) return "acknowledgement";
  if (UNCERTAIN.test(clean)) return "uncertain";
  if (PRESENCE.test(clean)) return "presence";
  if (SMALL_TALK.test(clean)) return "small-talk";
  if (UNSUPPORTED.test(clean)) return "unsupported";
  return null;
}

export function isLocalPathfinderPrompt(prompt: string): boolean {
  return localConversationKind(prompt) !== null;
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
