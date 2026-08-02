export type Language = "en" | "fr";

export type ChatRole = "user" | "assistant" | "model" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  currentSection?: string;
  currentProject?: string;
  language?: Language;
}

export interface ChatResponse {
  response: string;
  followUpSuggestions: string[];
}

export interface ResetResponse {
  status: "ok";
  reset: boolean;
  message: string;
}

export interface HealthResponse {
  status: "ok";
  uptime: number;
  version: string;
  environment: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
