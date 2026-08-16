import type { AppConfig } from "../types/config.js";
import type { ChatProvider, GroqErrorCode, GroqResponse, ProviderInput } from "../types/provider.js";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";

export class GroqServiceError extends Error {
  readonly code: GroqErrorCode;

  constructor(code: GroqErrorCode, message: string) {
    super(message);
    this.name = "GroqServiceError";
    this.code = code;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}

/**
 * Reusable, provider-agnostic Groq client.
 * The API key lives only here (from server config) and is never logged or exposed.
 */
export class GroqService implements ChatProvider {
  readonly name = "groq";

  private readonly apiKey: string;
  private readonly model: string;
  private readonly temperature: number;
  private readonly maxTokens: number;
  private readonly timeoutMs: number;

  constructor(config: AppConfig) {
    this.apiKey = config.groqApiKey;
    this.model = config.groqModel;
    this.temperature = config.groqTemperature;
    this.maxTokens = config.groqMaxTokens;
    this.timeoutMs = config.groqTimeoutMs;
  }

  get hasApiKey(): boolean {
    return this.apiKey.trim().length > 0;
  }

  async generateText(input: ProviderInput): Promise<string> {
    if (!this.hasApiKey) {
      throw new GroqServiceError("MISSING_API_KEY", "The Groq API key is not configured on the server.");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          messages: [
            { role: "system", content: input.systemPrompt },
            ...input.messages.map(message => ({
              role: message.role === "assistant" ? "assistant" : message.role,
              content: message.content
            }))
          ]
        }),
        signal: controller.signal
      });

      return await this.handleResponse(response);
    } catch (error) {
      if (isAbortError(error)) {
        throw new GroqServiceError("TIMEOUT", "Groq did not respond in time.");
      }
      if (error instanceof GroqServiceError) {
        throw error;
      }
      throw new GroqServiceError("NETWORK", "Network error while contacting Groq.");
    } finally {
      clearTimeout(timer);
    }
  }

  private async handleResponse(response: Response): Promise<string> {
    let data: GroqResponse | null = null;
    try {
      data = (await response.json()) as GroqResponse;
    } catch {
      // leave data null; handled below
    }

    if (!response.ok) {
      throw this.mapHttpError(response.status, data?.error?.message ?? data?.error?.error?.message ?? "");
    }

    const text =
      data?.choices
        ?.map(choice => choice.message?.content ?? "")
        .join("") ?? "";

    if (!text.trim()) {
      throw new GroqServiceError("EMPTY", "Groq returned an empty response.");
    }

    return text;
  }

  private mapHttpError(status: number, apiMessage: string): GroqServiceError {
    const detail = apiMessage ? ` (${apiMessage})` : "";

    switch (status) {
      case 400:
        return new GroqServiceError("BAD_REQUEST", `Groq rejected the request.${detail}`);
      case 401:
      case 403:
        return new GroqServiceError("UNAUTHORIZED", `The Groq API key is invalid or unauthorized.${detail}`);
      case 404:
        return new GroqServiceError("BAD_REQUEST", `Groq model not found.${detail}`);
      case 429: {
        if (/quota/i.test(apiMessage)) {
          return new GroqServiceError("QUOTA_EXCEEDED", `Groq quota exceeded.${detail}`);
        }
        return new GroqServiceError("RATE_LIMIT", `Groq rate limit reached.${detail}`);
      }
      default:
        return status >= 500
          ? new GroqServiceError("UPSTREAM", `Groq is temporarily unavailable.${detail}`)
          : new GroqServiceError("BAD_REQUEST", `Groq request failed.${detail}`);
    }
  }
}
