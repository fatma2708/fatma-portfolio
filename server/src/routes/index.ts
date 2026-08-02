import { Router } from "express";
import type { ChatController } from "../controllers/chat.controller.js";
import type { HealthController } from "../controllers/health.controller.js";
import type { AppConfig } from "../types/config.js";
import { chatRoutes } from "./chat.routes.js";
import { healthRoutes } from "./health.routes.js";

export function apiRoutes(
  config: AppConfig,
  chatController: ChatController,
  healthController: HealthController
): Router {
  const router = Router();
  router.use(chatRoutes(chatController, config));
  router.use(healthRoutes(healthController));
  return router;
}
