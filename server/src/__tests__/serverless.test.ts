import { describe, expect, it } from "vitest";
import { buildDependencies } from "../container.js";
import { createHandler } from "../serverless.js";
import type { ChatProvider } from "../types/gemini.js";

type WrappedHandler = (event: unknown, context: unknown) => Promise<{ statusCode: number; body: string }>;

const fakeProvider: ChatProvider = {
  name: "fake",
  generateText: async () => "Hello from F.A.I."
};

async function makeHandler(): Promise<WrappedHandler> {
  const deps = await buildDependencies({
    config: { env: "test", logLevel: "silent" },
    provider: fakeProvider
  });
  return createHandler(deps) as unknown as WrappedHandler;
}

describe("serverless handler", () => {
  it("responds through the serverless wrapper (Vercel / Netlify)", async () => {
    const handler = await makeHandler();

    const event = {
      httpMethod: "GET",
      path: "/api/health",
      headers: {},
      multiValueHeaders: {},
      body: null,
      isBase64Encoded: false,
      requestContext: {}
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body) as { status: string };
    expect(body.status).toBe("ok");
  });

  it("handles a chat request through the serverless wrapper", async () => {
    const handler = await makeHandler();

    const event = {
      httpMethod: "POST",
      path: "/api/chat",
      headers: { "content-type": "application/json" },
      multiValueHeaders: {},
      body: JSON.stringify({ message: "Tell me about Fatma" }),
      isBase64Encoded: false,
      requestContext: {}
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body) as { response: string };
    expect(body.response).toBe("Hello from F.A.I.");
  });
});
