import type { Logger } from "pino";
import pino from "pino";
import type { AppConfig } from "../types/config.js";

/**
 * Structured logger. Dev uses pretty transport for readability,
 * production emits plain JSON (minimal, machine-readable).
 * Secrets are never logged — redaction is configured defensively.
 */
export function createLogger(config: AppConfig): Logger {
  const isProduction = config.env === "production";

  return pino({
    level: config.logLevel,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers['x-api-key']",
        "*.apiKey",
        "*.GEMINI_API_KEY",
        "*.password",
        "*.token"
      ],
      censor: "[REDACTED]"
    },
    ...(isProduction
      ? {}
      : {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" }
          }
        })
  });
}
