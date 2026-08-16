import type { ChatMessage } from "./chat.js";

export type ProviderErrorCode =
  | "MISSING_API_KEY"
  | "UNAUTHORIZED"
  | "RATE_LIMIT"
  | "QUOTA_EXCEEDED"
  | "TIMEOUT"
  | "NETWORK"
  | "BLOCKED"
  | "EMPTY"
  | "UPSTREAM"
  | "BAD_REQUEST";

export type GroqErrorCode = ProviderErrorCode;

/**
 * Provider-agnostic contract. Swap Groq for OpenAI, Claude, etc.
 * by implementing this interface — the frontend never changes.
 */
export interface ChatProvider {
  readonly name: string;
  generateText(input: ProviderInput): Promise<string>;
}

export interface ProviderInput {
  systemPrompt: string;
  messages: ChatMessage[];
}

export interface GroqChoice {
  message?: { role?: string; content?: string };
  finish_reason?: string;
}

export interface GroqApiError {
  message?: string;
  error?: { message?: string; type?: string };
}

export interface GroqResponse {
  choices?: GroqChoice[];
  error?: GroqApiError;
}
