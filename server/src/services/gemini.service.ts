import type { AppConfig } from "../types/config.js";
import type { ChatProvider, GeminiErrorCode, GeminiResponse, ProviderInput } from "../types/gemini.js";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export class GeminiServiceError extends Error {
  readonly code: GeminiErrorCode;

  constructor(code: GeminiErrorCode, message: string) {
    super(message);
    this.name = "GeminiServiceError";
    this.code = code;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}

/**
 * Reusable, provider-agnostic Gemini client.
 * The API key lives only here (from server config) and is never logged or exposed.
 */
export class GeminiService implements ChatProvider {
  readonly name = "gemini";

  private readonly apiKey: string;
  private readonly model: string;
  private readonly temperature: number;
  private readonly maxTokens: number;
  private readonly timeoutMs: number;

  constructor(config: AppConfig) {
    this.apiKey = config.geminiApiKey;
    this.model = config.geminiModel;
    this.temperature = config.geminiTemperature;
    this.maxTokens = config.geminiMaxTokens;
    this.timeoutMs = config.geminiTimeoutMs;
  }

  get hasApiKey(): boolean {
    return this.apiKey.trim().length > 0;
  }

  async generateText(input: ProviderInput): Promise<string> {
    if (!this.hasApiKey) {
      throw new GeminiServiceError("MISSING_API_KEY", "The Gemini API key is not configured on the server.");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(
        `${API_BASE}/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: input.systemPrompt }] },
            contents: input.messages.map(message => ({
              role: message.role === "assistant" ? "model" : message.role,
              parts: [{ text: message.content }]
            })),
            generationConfig: {
              temperature: this.temperature,
              topP: 0.95,
              maxOutputTokens: this.maxTokens
            }
          }),
          signal: controller.signal
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      if (isAbortError(error)) {
        throw new GeminiServiceError("TIMEOUT", "Gemini did not respond in time.");
      }
      if (error instanceof GeminiServiceError) {
        throw error;
      }
      throw new GeminiServiceError("NETWORK", "Network error while contacting Gemini.");
    } finally {
      clearTimeout(timer);
    }
  }

  private async handleResponse(response: Response): Promise<string> {
    let data: GeminiResponse | null = null;
    try {
      data = (await response.json()) as GeminiResponse;
    } catch {
      // leave data null; handled below
    }

    if (!response.ok) {
      throw this.mapHttpError(response.status, data?.error?.message ?? "");
    }

    if (data?.promptFeedback?.blockReason) {
      throw new GeminiServiceError("BLOCKED", "The request was blocked by safety filters.");
    }

    const finishReason = data?.candidates?.[0]?.finishReason;
    if (finishReason === "SAFETY" || finishReason === "BLOCKED") {
      throw new GeminiServiceError("BLOCKED", "The response was blocked by safety filters.");
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text ?? "")
        .join("") ?? "";

    if (!text.trim()) {
      throw new GeminiServiceError("EMPTY", "Gemini returned an empty response.");
    }

    return text;
  }

  private mapHttpError(status: number, apiMessage: string): GeminiServiceError {
    const detail = apiMessage ? ` (${apiMessage})` : "";

    switch (status) {
      case 400:
        return new GeminiServiceError("BAD_REQUEST", `Gemini rejected the request.${detail}`);
      case 401:
      case 403:
        return new GeminiServiceError("UNAUTHORIZED", `The Gemini API key is invalid or unauthorized.${detail}`);
      case 404:
        return new GeminiServiceError("BAD_REQUEST", `Gemini model not found.${detail}`);
      case 429: {
        if (/quota/i.test(apiMessage)) {
          return new GeminiServiceError("QUOTA_EXCEEDED", `Gemini quota exceeded.${detail}`);
        }
        return new GeminiServiceError("RATE_LIMIT", `Gemini rate limit reached.${detail}`);
      }
      default:
        return status >= 500
          ? new GeminiServiceError("UPSTREAM", `Gemini is temporarily unavailable.${detail}`)
          : new GeminiServiceError("BAD_REQUEST", `Gemini request failed.${detail}`);
    }
  }
}
