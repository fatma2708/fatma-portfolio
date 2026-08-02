import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { buildDependencies } from "../container.js";
import type { ChatProvider } from "../types/gemini.js";

const fakeProvider: ChatProvider = {
  name: "fake",
  generateText: async () => "Hello from F.A.I."
};

describe("Rate limiting", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const deps = await buildDependencies({
      config: { env: "test", logLevel: "silent", rateLimitMax: 3, rateLimitWindowMs: 60_000 },
      provider: fakeProvider
    });
    server = createApp(deps).listen(0);
    await new Promise<void>(resolve => server.once("listening", () => resolve()));
    const address = server.address();
    baseUrl = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
  });

  afterAll(() => new Promise<void>(resolve => server.close(() => resolve())));

  it("allows requests under the limit and returns 429 with Retry-After after it", async () => {
    for (let index = 0; index < 3; index += 1) {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "hello" })
      });
      expect(response.status).toBe(200);
    }

    const blocked = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "one more" })
    });

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();

    const body = (await blocked.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("RATE_LIMIT");
    expect(body.error.message.length).toBeGreaterThan(0);
  });
});
