import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import type { AppConfig, AppEnvironment } from "../types/config.js";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(0).max(65535).default(4000),
  HOST: z.string().trim().min(1).default("0.0.0.0"),
  GEMINI_API_KEY: z.string().trim().default(""),
  GEMINI_MODEL: z.string().trim().min(1).default("gemini-2.0-flash"),
  GEMINI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.6),
  GEMINI_MAX_TOKENS: z.coerce.number().int().positive().default(1024),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info")
});

type EnvInput = Record<string, string | number | undefined>;

function readVersion(): string {
  try {
    const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { version?: string };
    return pkg.version ?? "1.0.0";
  } catch {
    return "1.0.0";
  }
}

export function loadConfig(overrides: EnvInput = {}): AppConfig {
  const parsed = envSchema.parse({ ...process.env, ...overrides });

  const corsOrigins = parsed.CORS_ORIGIN.split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

  const env: AppEnvironment = parsed.NODE_ENV;

  return {
    env,
    port: parsed.PORT,
    host: parsed.HOST,
    geminiApiKey: parsed.GEMINI_API_KEY,
    geminiModel: parsed.GEMINI_MODEL,
    geminiTemperature: parsed.GEMINI_TEMPERATURE,
    geminiMaxTokens: parsed.GEMINI_MAX_TOKENS,
    geminiTimeoutMs: parsed.GEMINI_TIMEOUT_MS,
    corsOrigins,
    rateLimitMax: parsed.RATE_LIMIT_MAX,
    rateLimitWindowMs: parsed.RATE_LIMIT_WINDOW_MS,
    trustProxy: parsed.TRUST_PROXY,
    logLevel: parsed.LOG_LEVEL,
    version: readVersion()
  };
}
