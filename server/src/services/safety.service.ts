import type { Language } from "../types/chat.js";

export interface Refusal {
  en: string;
  fr: string;
}

export interface SafetyResult {
  blocked: boolean;
  refusal: Refusal;
}

const INJECTION_PATTERNS: RegExp[] = [
  // ── English ──────────────────────────────────────────────
  /ignore\s+(?:all\s+|any\s+|the\s+|your\s+)*(?:previous|prior|above|earlier|system)\s+instructions/i,
  /disregard\s+(?:all\s+|any\s+|the\s+)*(?:previous|prior|above|earlier|system)\s+instructions/i,
  /you\s+are\s+now\s+(?:the\s+)?/i,
  /you\s+are\s+no\s+longer\s+/i,
  /(?:reveal|show|print|output|paste|write|repeat|tell\s+me|give\s+me)\s+(?:your|the)\s+(?:system\s+prompt|prompt|hidden\s+instructions|instructions)/i,
  /(?:system\s+)?prompt\s+(?:injection|leak|bypass)/i,
  /(?:reveal|give|show|leak|share|send|tell)\s+.*?(?:api\s*key|secret|password|token|credential|environment|env\s+var)/i,
  /what\s+is\s+your\s+(?:api\s*key|system\s+prompt|hidden\s+instructions|instructions)/i,
  /deobfuscate\s+(?:your|the)\s+instructions/i,
  /you\s+are\s+chatgpt\s*,\s*(?:now\s+)?/i,

  // ── French ───────────────────────────────────────────────
  /ignor[ée]\s+(?:toutes\s+|les\s+|tes\s+|ces\s+|tes\s+instructions\s+)*(?:pr[ée]c[ée]dentes\s+)?(?:instructions|consignes)/i,
  /ne\s+tiens\s+pas\s+compte\s+des\s+instructions/i,
  /(?:r[ée]v[èe]le|montre|affiche|[ée]cris|imprime|r[ée]p[èe]te)\s+ton\s+prompt/i,
  /(?:prompt\s+)?(?:injection|fuite)\s+de\s+prompt/i,
  /(?:r[ée]v[èe]le|donne|montre|partage|envoie)\s*(?:-[a-zà-ÿ]+)?\s+.*?(?:cl[ée]\s+api|secret|mot\s+de\s+passe|token|identifiants?|variables?\s+d.?\?environnement)/i,
  /(?:c[’']est\s+quoi|quel\s+est)\s+ton\s+prompt(?:\s+syst[èe]me)?/i,
  /tu\s+es\s+maintenant\s+/i
];

const REFUSAL: Refusal = {
  en: "I can't share internal instructions or secrets — I'm here to talk about Fatma! Ask me anything about her projects, experience, skills, or career.",
  fr: "Je ne peux pas partager mes instructions internes ni aucun secret — je suis là pour parler de Fatma ! Demande-moi ce que tu veux sur ses projets, son expérience, ses compétences ou sa carrière."
};

/**
 * Blocks prompt-injection and secret-disclosure attempts at the edge,
 * before anything reaches the model. Defense in depth: the system
 * prompt also hardens against these requests.
 */
export class SafetyService {
  check(message: string): SafetyResult {
    if (INJECTION_PATTERNS.some(pattern => pattern.test(message))) {
      return { blocked: true, refusal: REFUSAL };
    }
    return { blocked: false, refusal: REFUSAL };
  }
}

export function refusalFor(language: Language, refusal: Refusal): string {
  return language === "fr" ? refusal.fr : refusal.en;
}
