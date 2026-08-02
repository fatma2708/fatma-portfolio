import { afterEach, describe, expect, it, vi } from "vitest";
import { GeminiService } from "../services/gemini.service.js";
import type { AppConfig } from "../types/config.js";
import type { ProviderInput } from "../types/gemini.js";

function makeConfig(partial: Partial<AppConfig> = {}): AppConfig {
  return {
    env: "test",
    port: 4000,
    host: "127.0.0.1",
    geminiApiKey: "test-key",
    geminiModel: "gemini-2.0-flash",
    geminiTemperature: 0.6,
    geminiMaxTokens: 1024,
    geminiTimeoutMs: 5000,
    corsOrigins: ["http://localhost:3000"],
    rateLimitMax: 20,
    rateLimitWindowMs: 60_000,
    trustProxy: 1,
    logLevel: "silent",
    version: "1.0.0",
    ...partial
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

const input: ProviderInput = {
  systemPrompt: "You are F.A.I.",
  messages: [{ role: "user", content: "Hi" }]
};

describe("GeminiService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns text from a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ candidates: [{ content: { parts: [{ text: "Hello from Gemini" }] }, finishReason: "STOP" }] })
      )
    );

    const service = new GeminiService(makeConfig());
    await expect(service.generateText(input)).resolves.toBe("Hello from Gemini");
  });

  it("maps assistant roles to Gemini's model role", async () => {
    const fetchMock = vi.fn(async (_url: unknown, _init: RequestInit) => {
      return jsonResponse({ candidates: [{ content: { parts: [{ text: "ok" }] } }] });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new GeminiService(makeConfig());
    await service.generateText({
      systemPrompt: "s",
      messages: [
        { role: "assistant", content: "previous answer" },
        { role: "user", content: "next question" }
      ]
    });

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(requestBody.contents[0].role).toBe("model");
    expect(requestBody.contents[1].role).toBe("user");
  });

  it("sends the system prompt in systemInstruction", async () => {
    const fetchMock = vi.fn(async (_url: unknown, _init: RequestInit) => {
      return jsonResponse({ candidates: [{ content: { parts: [{ text: "ok" }] } }] });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new GeminiService(makeConfig());
    await service.generateText({ systemPrompt: "SECRET SYSTEM PROMPT", messages: [] });

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(requestBody.systemInstruction.parts[0].text).toBe("SECRET SYSTEM PROMPT");
  });

  it("throws MISSING_API_KEY when no key is configured", async () => {
    const service = new GeminiService(makeConfig({ geminiApiKey: "" }));
    await expect(service.generateText(input)).rejects.toMatchObject({ code: "MISSING_API_KEY" });
  });

  it.each([
    [401, "UNAUTHORIZED"],
    [403, "UNAUTHORIZED"],
    [429, "RATE_LIMIT"],
    [400, "BAD_REQUEST"],
    [404, "BAD_REQUEST"],
    [500, "UPSTREAM"],
    [503, "UPSTREAM"]
  ])("maps HTTP %i to code %s", async (status, code) => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error: { message: "boom" } }, status)));
    const service = new GeminiService(makeConfig());
    await expect(service.generateText(input)).rejects.toMatchObject({ code });
  });

  it("maps quota errors to QUOTA_EXCEEDED", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ error: { message: "Quota exceeded for quota metric" } }, 429)
      )
    );
    const service = new GeminiService(makeConfig());
    await expect(service.generateText(input)).rejects.toMatchObject({ code: "QUOTA_EXCEEDED" });
  });

  it("throws BLOCKED on a safety finish reason", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ candidates: [{ finishReason: "SAFETY" }] }))
    );
    const service = new GeminiService(makeConfig());
    await expect(service.generateText(input)).rejects.toMatchObject({ code: "BLOCKED" });
  });

  it("throws BLOCKED when prompt feedback reports a block reason", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ promptFeedback: { blockReason: "SAFETY" }, candidates: [] })
      )
    );
    const service = new GeminiService(makeConfig());
    await expect(service.generateText(input)).rejects.toMatchObject({ code: "BLOCKED" });
  });

  it("throws EMPTY when no text is returned", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ candidates: [{ content: { parts: [] } }] })));
    const service = new GeminiService(makeConfig());
    await expect(service.generateText(input)).rejects.toMatchObject({ code: "EMPTY" });
  });

  it("throws TIMEOUT when the request is aborted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: unknown, init: RequestInit) => {
        return new Promise((_resolve, reject) => {
          const signal = init.signal as AbortSignal;
          signal.addEventListener("abort", () => {
            const error = new Error("The operation was aborted");
            error.name = "AbortError";
            reject(error);
          });
        });
      })
    );

    const service = new GeminiService(makeConfig({ geminiTimeoutMs: 20 }));
    await expect(service.generateText(input)).rejects.toMatchObject({ code: "TIMEOUT" });
  });

  it("throws NETWORK on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    }));
    const service = new GeminiService(makeConfig());
    await expect(service.generateText(input)).rejects.toMatchObject({ code: "NETWORK" });
  });
});
