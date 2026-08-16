import "dotenv/config";
import type { Logger } from "pino";
import { loadConfig } from "./config/env.js";
import { GroqService } from "./services/groq.service.js";
import { KnowledgeService } from "./services/knowledge.service.js";
import { PromptBuilder } from "./services/prompt-builder.service.js";
import { SafetyService } from "./services/safety.service.js";
import { SuggestionService } from "./services/suggestion.service.js";
import type { AppConfig } from "./types/config.js";
import type { ChatProvider } from "./types/provider.js";
import { createLogger } from "./utils/logger.js";
import type { AppDependencies } from "./app.js";

export type DependencyOverrides = Partial<Omit<AppDependencies, "config">> & {
  config?: Partial<AppConfig>;
};

/**
 * Composition root. Loads config from the environment, instantiates
 * every service exactly once, and returns a fully-wired dependency set.
 */
export async function buildDependencies(overrides: DependencyOverrides = {}): Promise<AppDependencies> {
  const config: AppConfig = { ...loadConfig(), ...overrides.config };
  const logger: Logger = overrides.logger ?? createLogger(config);

  const knowledge: KnowledgeService = overrides.knowledge ?? new KnowledgeService();
  if (!knowledge.loaded) {
    await knowledge.load();
  }

  const provider: ChatProvider = overrides.provider ?? new GroqService(config);
  const promptBuilder: PromptBuilder = overrides.promptBuilder ?? new PromptBuilder(knowledge);
  const safety: SafetyService = overrides.safety ?? new SafetyService();
  const suggestions: SuggestionService = overrides.suggestions ?? new SuggestionService(knowledge);

  return { config, logger, knowledge, promptBuilder, safety, suggestions, provider };
}
