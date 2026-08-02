import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import type { AppConfig } from "../types/config.js";

/**
 * IP-based rate limiter for chat endpoints.
 * Returns 429 with Retry-After when a client exceeds the limit.
 */
export function createRateLimiter(config: AppConfig): RequestHandler {
  return rateLimit({
    windowMs: config.rateLimitWindowMs,
    limit: config.rateLimitMax,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req) => {
      const ip = req.ip ?? req.socket?.remoteAddress ?? "unknown";
      return ip;
    },
    message: {
      error: {
        code: "RATE_LIMIT",
        message: "Too many requests. Please slow down and try again in a minute."
      }
    },
    handler: (_req, res, _next, options) => {
      res.status(429).json(options.message);
    }
  });
}
