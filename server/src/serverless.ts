import serverless from "serverless-http";
import type { AppDependencies } from "./app.js";
import { createApp } from "./app.js";
import { buildDependencies } from "./container.js";

type ServerlessHandler = (event: unknown, context: unknown) => Promise<unknown>;
type IncomingRequest = { body?: unknown };

function parseBody(req: IncomingRequest): void {
  const raw = req.body;
  if (Buffer.isBuffer(raw)) {
    const text = raw.toString("utf8");
    try {
      req.body = text ? JSON.parse(text) : undefined;
    } catch {
      req.body = undefined;
    }
  } else if (typeof raw === "string") {
    try {
      req.body = raw ? JSON.parse(raw) : undefined;
    } catch {
      req.body = undefined;
    }
  }
}

/**
 * Wrap an already-built dependency container in a serverless handler.
 * serverless-http builds an IncomingMessage flagged `complete: true` /
 * `readable: false`, which makes body-parser skip parsing. We pre-parse the
 * JSON body here so Express 5 routes always receive an object.
 */
export function createHandler(deps: AppDependencies): ServerlessHandler {
  return serverless(createApp(deps), {
    request: (req: IncomingRequest) => {
      parseBody(req);
      return req;
    }
  }) as unknown as ServerlessHandler;
}

let cachedHandler: ServerlessHandler | null = null;

/**
 * Serverless entry point for Vercel / Netlify Functions.
 * The first warm invocation builds dependencies, then reuses them.
 */
export async function handler(event: unknown, context: unknown): Promise<unknown> {
  if (!cachedHandler) {
    cachedHandler = createHandler(await buildDependencies());
  }
  return cachedHandler(event, context);
}
