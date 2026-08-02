// Frontend knowledge is served by the F.A.I. backend (server/src/knowledge).
// The browser only needs the welcome copy, suggestion chips, and a tiny
// language heuristic for the chat UI.

export const WELCOME = `Hi! 👋

I'm F.A.I. (Fatma Artificial Intelligence).

I know everything about Fatma's projects, experience, skills, technologies and journey.

You can ask me questions in English or Français.

What would you like to know?`;

export const SUGGESTIONS = [
  { group: "EN", label: "Tell me about yourself", prompt: "Tell me about yourself" },
  { group: "EN", label: "Why Cloud Computing?", prompt: "Why Cloud Computing?" },
  { group: "EN", label: "What projects are you most proud of?", prompt: "What projects are you most proud of?" },
  { group: "EN", label: "Tell me about FoundersLab", prompt: "Tell me about FoundersLab" },
  { group: "EN", label: "Explain StackPilot", prompt: "Explain StackPilot" },
  { group: "EN", label: "What technologies do you know?", prompt: "What technologies do you know?" },
  { group: "EN", label: "Why AI?", prompt: "Why AI?" },
  { group: "EN", label: "What are your career goals?", prompt: "What are your career goals?" },
  { group: "FR", label: "Présente-toi", prompt: "Présente-toi" },
  { group: "FR", label: "Pourquoi le Cloud ?", prompt: "Pourquoi le Cloud ?" },
  { group: "FR", label: "Pourquoi l'IA ?", prompt: "Pourquoi l'IA ?" },
  { group: "FR", label: "Quels sont tes projets ?", prompt: "Quels sont tes projets ?" },
  { group: "FR", label: "Parle-moi de FoundersLab", prompt: "Parle-moi de FoundersLab" },
  { group: "FR", label: "Quelles sont tes compétences ?", prompt: "Quelles sont tes compétences ?" },
  { group: "FR", label: "Pourquoi devrais-je te recruter ?", prompt: "Pourquoi devrais-je te recruter ?" }
];

export function detectLanguage(text) {
  const trimmed = String(text || "").trim();
  const frWords =
    /(^|\s)(bonjour|salut|présente|pourquoi|quelles|quels|comment|compétences|projets|parle|recruter|objectif|contacte|cherche|veux|peux|raconte|quand|où|qu'est|suis|êtes)\b/i;
  if (frWords.test(trimmed)) return "fr";
  if (/[éèêàçùâîôûœ]/i.test(trimmed)) return "fr";
  return "en";
}
