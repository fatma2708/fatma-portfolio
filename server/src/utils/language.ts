import type { Language } from "../types/chat.js";

const FR_WORD_RE =
  /(^|\s)(bonjour|salut|pr[ée]sente|pourquoi|quelles|quels|comment|comp[ée]tences|projets|parle|recruter|objectif|contacte|cherche|veux|peux|raconte|quand|o[ûu]|qu'est|suis|[ée]tes)\b/i;
const ACCENT_RE = /[éèêàçùâîôûœ]/i;

/**
 * Heuristic language detection. Returns "fr" when the message clearly
 * looks French, otherwise "en". Used only when the client omits `language`.
 */
export function detectLanguage(text: string | null | undefined): Language {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return "en";
  if (FR_WORD_RE.test(trimmed)) return "fr";
  if (ACCENT_RE.test(trimmed)) return "fr";
  return "en";
}
