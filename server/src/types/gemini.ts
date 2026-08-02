import type { ChatMessage } from "./chat.js";

export type GeminiErrorCode =
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

/**
 * Provider-agnostic contract. Swap Gemini for OpenAI, Claude, etc.
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

export interface GeminiPart {
  text?: string;
}

export interface GeminiContent {
  parts?: GeminiPart[];
  role?: string;
}

export interface GeminiCandidate {
  content?: GeminiContent;
  finishReason?: string;
}

export interface GeminiApiError {
  message?: string;
  status?: string;
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
  error?: GeminiApiError;
}
