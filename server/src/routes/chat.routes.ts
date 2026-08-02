import { Router } from "express";
import type { ChatController } from "../controllers/chat.controller.js";
import { createRateLimiter } from "../middleware/rate-limit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { ChatSchema } from "../schemas/chat.schema.js";
import type { AppConfig } from "../types/config.js";
import type { ResetResponse } from "../types/chat.js";
import { asyncHandler } from "../utils/http.js";

export function chatRoutes(controller: ChatController, config: AppConfig): Router {
  const router = Router();
  const limiter = createRateLimiter(config);

  router.post(
    "/chat",
    limiter,
    validate(ChatSchema),
    asyncHandler(async (req, res) => {
      const result = await controller.handleChat(req);
      res.json(result);
    })
  );

  router.post("/reset", limiter, (_req, res) => {
    const body: ResetResponse = {
      status: "ok",
      reset: true,
      message: "F.A.I. is stateless; the conversation is managed by the client."
    };
    res.json(body);
  });

  return router;
}
