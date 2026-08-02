import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { Logger } from "pino";
import type { AppConfig } from "./types/config.js";
import type { ChatProvider } from "./types/gemini.js";
import type { KnowledgeService } from "./services/knowledge.service.js";
import type { PromptBuilder } from "./services/prompt-builder.service.js";
import type { SafetyService } from "./services/safety.service.js";
import type { SuggestionService } from "./services/suggestion.service.js";
import { ChatController } from "./controllers/chat.controller.js";
import { HealthController } from "./controllers/health.controller.js";
import { createErrorHandler } from "./middleware/error.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";
import { apiRoutes } from "./routes/index.js";

export interface AppDependencies {
  config: AppConfig;
  logger: Logger;
  knowledge: KnowledgeService;
  promptBuilder: PromptBuilder;
  safety: SafetyService;
  suggestions: SuggestionService;
  provider: ChatProvider;
}

/**
 * Composes the Express app from dependencies (manual DI).
 * The app itself is pure — tests can inject mocks for every service.
 */
export function createApp(deps: AppDependencies): express.Express {
  const { config, logger } = deps;

  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);

  // Security headers (CSP disabled: this API only returns JSON, and the SPA's
  // page is served from the frontend host, not here).
  app.use(helmet({ contentSecurityPolicy: false }));

  app.use(requestLogger(logger));
  app.use(
    cors({
      origin: config.corsOrigins,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"]
    })
  );
  app.use(express.json({ limit: "32kb" }));

  const chatController = new ChatController(
    deps.provider,
    deps.promptBuilder,
    deps.safety,
    deps.suggestions
  );
  const healthController = new HealthController(config);

  app.use("/api", apiRoutes(config, chatController, healthController));

  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));

  return app;
}
