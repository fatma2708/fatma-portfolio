import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { KnowledgeBase, KnowledgeFile, Project } from "../types/knowledge.js";
import { KNOWLEDGE_DIR } from "../utils/paths.js";

const KNOWLEDGE_FILES: KnowledgeFile[] = [
  "about",
  "projects",
  "experience",
  "education",
  "skills",
  "personality",
  "funfacts",
  "faq",
  "contact"
];

/**
 * Some knowledge files wrap their data under a key (e.g. `projects.json`
 * is `{ "projects": [...] }`). The unwrapped value is what `KnowledgeBase`
 * expects. Files absent from this map are stored as-is.
 */
const FILE_WRAPPERS: Partial<Record<KnowledgeFile, string>> = {
  projects: "projects",
  experience: "experiences",
  education: "education",
  skills: "categories",
  funfacts: "funfacts",
  faq: "faq"
};

/**
 * Aliases let visitors (and the portfolio) refer to projects loosely.
 * "AI Internship" maps to the AI Psychometric Assessment Platform, etc.
 */
const PROJECT_ALIASES: Record<string, string> = {
  "ai internship": "AI Psychometric Assessment Platform",
  "ai-internship": "AI Psychometric Assessment Platform",
  "ai internship platform": "AI Psychometric Assessment Platform",
  "internship": "AI Psychometric Assessment Platform",
  "psychometric": "AI Psychometric Assessment Platform",
  "psychometric assessment": "AI Psychometric Assessment Platform",
  "psychometric assessment platform": "AI Psychometric Assessment Platform",
  "automatch": "AutoMatch",
  "automatchai": "AutoMatch",
  "auto match": "AutoMatch",
  "founderslab": "FoundersLab",
  "founder's lab": "FoundersLab",
  "stackpilot": "StackPilot",
  "stack pilot": "StackPilot",
  "fitsync": "FITSYNC",
  "fit sync": "FITSYNC",
  "fyp cooked": "FYP Cooked",
  "fypcooked": "FYP Cooked",
  "cooked": "FYP Cooked",
  "fyp": "FYP Cooked",
  "fyp-analyzer": "FYP Cooked",
  "fyp analyzer": "FYP Cooked",
  "fyp analyzer project": "FYP Cooked"
};

export class KnowledgeService {
  private knowledge: KnowledgeBase | null = null;

  /** Reads every JSON file in `src/knowledge` into memory. Async + cached. */
  async load(): Promise<KnowledgeBase> {
    const entries: Partial<Record<KnowledgeFile, unknown>> = {};

    for (const file of KNOWLEDGE_FILES) {
      const raw = await readFile(join(KNOWLEDGE_DIR, `${file}.json`), "utf8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const wrapper = FILE_WRAPPERS[file];
      entries[file] = wrapper ? parsed[wrapper] : parsed;
    }

    this.knowledge = entries as unknown as KnowledgeBase;
    return this.knowledge;
  }

  get loaded(): boolean {
    return this.knowledge !== null;
  }

  getKnowledge(): KnowledgeBase {
    if (!this.knowledge) {
      throw new Error("KnowledgeService.load() must be called before use.");
    }
    return this.knowledge;
  }

  getProject(name: string | undefined | null): Project | null {
    if (!name) return null;

    const key = name.trim().toLowerCase();
    const target = PROJECT_ALIASES[key] ?? name.trim();

    const found = this.getKnowledge().projects.find(
      project => project.name.toLowerCase() === target.toLowerCase()
    );

    return found ?? null;
  }
}
