import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { buildDependencies } from "../container.js";
import type { ChatProvider } from "../types/provider.js";

const fakeProvider: ChatProvider = {
  name: "fake",
  generateText: async () => "Hello from F.A.I."
};

describe("HTTP API", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const deps = await buildDependencies({
      config: { env: "test", logLevel: "silent" },
      provider: fakeProvider
    });
    server = createApp(deps).listen(0);
    await new Promise<void>(resolve => server.once("listening", () => resolve()));
    const address = server.address();
    baseUrl = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
  });

  afterAll(() => new Promise<void>(resolve => server.close(() => resolve())));

  function post(path: string, body: unknown, extra: RequestInit = {}) {
    return fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
      ...extra
    });
  }

  it("GET /api/health returns status, uptime, version, environment", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body.status).toBe("ok");
    expect(typeof body.uptime).toBe("number");
    expect(typeof body.version).toBe("string");
    expect(body.environment).toBe("test");
  });

  it("POST /api/chat returns response + followUpSuggestions", async () => {
    const response = await post("/api/chat", { message: "Tell me about Fatma" });
    expect(response.status).toBe(200);

    const body = (await response.json()) as { response: string; followUpSuggestions: string[] };
    expect(body.response).toBe("Hello from F.A.I.");
    expect(body.followUpSuggestions).toHaveLength(3);
  });

  it("rejects empty messages with 400 VALIDATION", async () => {
    const response = await post("/api/chat", { message: "   " });
    expect(response.status).toBe(400);

    const body = (await response.json()) as { error: { code: string } };
    expect(body.error.code).toBe("VALIDATION");
  });

  it("rejects malformed JSON with 400", async () => {
    const response = await post("/api/chat", "{not-json", { headers: { "Content-Type": "application/json" } });
    expect(response.status).toBe(400);
  });

  it("rejects oversized messages with 400", async () => {
    const response = await post("/api/chat", { message: "x".repeat(2001) });
    expect(response.status).toBe(400);
  });

  it("POST /api/reset succeeds (stateless)", async () => {
    const response = await post("/api/reset", {});
    expect(response.status).toBe(200);

    const body = (await response.json()) as { status: string; reset: boolean };
    expect(body.status).toBe("ok");
    expect(body.reset).toBe(true);
  });

  it("returns 404 for unknown routes", async () => {
    const response = await fetch(`${baseUrl}/api/nope`);
    expect(response.status).toBe(404);
  });

  it("returns a generic 500 without leaking internals for unknown errors", async () => {
    const deps = await buildDependencies({
      config: { env: "test", logLevel: "silent" },
      provider: { name: "boom", generateText: async () => {
        throw new Error("internal stack detail here");
      } }
    });
    const boomServer = createApp(deps).listen(0);
    await new Promise<void>(resolve => boomServer.once("listening", () => resolve()));
    const address = boomServer.address();
    const boomUrl = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;

    try {
      const response = await fetch(`${boomUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "hello" })
      });
      expect(response.status).toBe(500);
      const body = (await response.json()) as { error: { code: string; message: string } };
      expect(body.error.code).toBe("INTERNAL");
      expect(body.error.message).not.toContain("internal stack detail");
    } finally {
      boomServer.close();
    }
  });

  it("enforces the CORS allowlist", async () => {
    const allowed = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: "http://localhost:3000" }
    });
    expect(allowed.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");

    const blocked = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: "http://evil.example.com" }
    });
    expect(blocked.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("sends security headers and hides the framework", async () => {
    const response = await fetch(`${baseUrl}/api/health`);

    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("x-powered-by")).toBeNull();
  });
});
