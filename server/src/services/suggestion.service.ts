import type { Language } from "../types/chat.js";
import type { KnowledgeService } from "./knowledge.service.js";

const PROJECT_SUGGESTIONS = {
  en: (project: string) => [
    `Tell me more about ${project}`,
    "What was the biggest challenge on this project?",
    "What tech stack powers this project?"
  ],
  fr: (project: string) => [
    `Parle-moi davantage de ${project}`,
    "Quel a été le plus grand défi de ce projet ?",
    "Quelle stack technique alimente ce projet ?"
  ]
};

const SECTION_SUGGESTIONS: Record<string, { en: string[]; fr: string[] }> = {
  identity: {
    en: ["What are Fatma's career goals?", "What motivates Fatma?", "What are Fatma's strengths?"],
    fr: ["Quels sont les objectifs de carrière de Fatma ?", "Qu'est-ce qui motive Fatma ?", "Quelles sont les forces de Fatma ?"]
  },
  missions: {
    en: ["Which project is Fatma most proud of?", "Explain the FoundersLab platform", "What is Fatma's tech stack?"],
    fr: ["Quel est le projet préféré de Fatma ?", "Explique la plateforme FoundersLab", "Quelles technologies utilise Fatma ?"]
  },
  skills: {
    en: ["What does Fatma do best?", "Why does Fatma love Kubernetes?", "Which languages does Fatma code in?"],
    fr: ["Dans quoi Fatma excelle-t-elle ?", "Pourquoi Fatma adore Kubernetes ?", "Quels langages Fatma utilise-t-elle ?"]
  },
  journey: {
    en: ["Tell me about Fatma's internships", "What did Fatma study at ESPRIT?", "How did Fatma get into AI?"],
    fr: ["Parle-moi des stages de Fatma", "Qu'a étudié Fatma à ESPRIT ?", "Comment Fatma s'est-elle lancée dans l'IA ?"]
  },
  contact: {
    en: ["How can I contact Fatma?", "Where can I see Fatma's code?", "What is Fatma looking for right now?"],
    fr: ["Comment puis-je contacter Fatma ?", "Où puis-je voir le code de Fatma ?", "Que recherche Fatma en ce moment ?"]
  }
};

const DEFAULT_SUGGESTIONS = {
  en: ["Tell me more about FoundersLab", "What inspired Fatma?", "Explain Fatma's cloud architecture"],
  fr: ["Parle-moi davantage de FoundersLab", "Qu'est-ce qui a inspiré Fatma ?", "Explique l'architecture cloud de Fatma"]
};

/**
 * Deterministic, context-aware follow-up suggestions.
 * Avoids an extra (expensive, slow) model call per reply.
 */
export class SuggestionService {
  constructor(private readonly knowledge: KnowledgeService) {}

  suggest(language: Language, section?: string, project?: string): string[] {
    const pool = language === "fr" ? "fr" : "en";

    const knownProject = this.knowledge.getProject(project);
    if (knownProject) {
      return PROJECT_SUGGESTIONS[pool](knownProject.name);
    }

    if (section && SECTION_SUGGESTIONS[section]) {
      return SECTION_SUGGESTIONS[section][pool];
    }

    return DEFAULT_SUGGESTIONS[pool];
  }
}
