export type AppEnvironment = "development" | "test" | "production";

export interface AppConfig {
  env: AppEnvironment;
  port: number;
  host: string;
  groqApiKey: string;
  groqModel: string;
  groqTemperature: number;
  groqMaxTokens: number;
  groqTimeoutMs: number;
  corsOrigins: string[];
  rateLimitMax: number;
  rateLimitWindowMs: number;
  trustProxy: number;
  logLevel: string;
  version: string;
}
