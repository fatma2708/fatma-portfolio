import { afterEach, describe, expect, it, vi } from "vitest";
import { GroqService } from "../services/groq.service.js";
import type { AppConfig } from "../types/config.js";
import type { ProviderInput } from "../types/provider.js";

function makeConfig(partial: Partial<AppConfig> = {}): AppConfig {
  return {
    env: "test",
    port: 4000,
    host: "127.0.0.1",
    groqApiKey: "test-key",
    groqModel: "llama-3.3-70b-versatile",
    groqTemperature: 0.6,
    groqMaxTokens: 1024,
    groqTimeoutMs: 5000,
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

describe("GroqService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns text from a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ choices: [{ message: { role: "assistant", content: "Hello from Groq" }, finish_reason: "stop" }] })
      )
    );

    const service = new GroqService(makeConfig());
    await expect(service.generateText(input)).resolves.toBe("Hello from Groq");
  });

  it("sends the system prompt as the first message with role system", async () => {
    const fetchMock = vi.fn(async (_url: unknown, _init: RequestInit) => {
      return jsonResponse({ choices: [{ message: { content: "ok" } }] });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new GroqService(makeConfig());
    await service.generateText({ systemPrompt: "SECRET SYSTEM PROMPT", messages: [] });

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(requestBody.messages[0].role).toBe("system");
    expect(requestBody.messages[0].content).toBe("SECRET SYSTEM PROMPT");
  });

  it("passes the model and temperature in the request body", async () => {
    const fetchMock = vi.fn(async (_url: unknown, _init: RequestInit) => {
      return jsonResponse({ choices: [{ message: { content: "ok" } }] });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new GroqService(makeConfig());
    await service.generateText(input);

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(requestBody.model).toBe("llama-3.3-70b-versatile");
    expect(requestBody.temperature).toBe(0.6);
  });

  it("sends the Authorization header with Bearer token", async () => {
    const fetchMock = vi.fn(async (_url: unknown, _init: RequestInit) => {
      return jsonResponse({ choices: [{ message: { content: "ok" } }] });
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new GroqService(makeConfig());
    await service.generateText(input);

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-key");
  });

  it("throws MISSING_API_KEY when no key is configured", async () => {
    const service = new GroqService(makeConfig({ groqApiKey: "" }));
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
    const service = new GroqService(makeConfig());
    await expect(service.generateText(input)).rejects.toMatchObject({ code });
  });

  it("maps quota errors to QUOTA_EXCEEDED", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ error: { message: "Quota exceeded for quota metric" } }, 429)
      )
    );
    const service = new GroqService(makeConfig());
    await expect(service.generateText(input)).rejects.toMatchObject({ code: "QUOTA_EXCEEDED" });
  });

  it("throws EMPTY when no text is returned", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ choices: [{ message: { content: "" } }] })));
    const service = new GroqService(makeConfig());
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

    const service = new GroqService(makeConfig({ groqTimeoutMs: 20 }));
    await expect(service.generateText(input)).rejects.toMatchObject({ code: "TIMEOUT" });
  });

  it("throws NETWORK on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    }));
    const service = new GroqService(makeConfig());
    await expect(service.generateText(input)).rejects.toMatchObject({ code: "NETWORK" });
  });
});
