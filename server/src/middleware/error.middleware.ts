import type { NextFunction, Request, Response } from "express";
import type { Logger } from "pino";
import { GeminiServiceError } from "../services/gemini.service.js";
import type { GeminiErrorCode } from "../types/gemini.js";
import { HttpError } from "../utils/http.js";

interface BodySyntaxError extends SyntaxError {
  body?: unknown;
}

function isBodySyntaxError(error: unknown): error is BodySyntaxError {
  return error instanceof SyntaxError && typeof (error as BodySyntaxError).body !== "undefined";
}

const GEMINI_STATUS: Record<GeminiErrorCode, number> = {
  MISSING_API_KEY: 503,
  UNAUTHORIZED: 401,
  RATE_LIMIT: 429,
  QUOTA_EXCEEDED: 429,
  TIMEOUT: 504,
  NETWORK: 502,
  BLOCKED: 400,
  EMPTY: 502,
  UPSTREAM: 502,
  BAD_REQUEST: 400
};

const GEMINI_MESSAGE: Record<GeminiErrorCode, string> = {
  MISSING_API_KEY: "F.A.I.'s AI provider is not configured yet. Please set GEMINI_API_KEY on the server and restart.",
  UNAUTHORIZED: "F.A.I.'s AI provider rejected the API key.",
  RATE_LIMIT: "Too many requests. Please wait a moment and try again.",
  QUOTA_EXCEEDED: "F.A.I. hit the AI provider's quota. Please try again later.",
  TIMEOUT: "F.A.I. took too long to respond. Please try again.",
  NETWORK: "F.A.I. couldn't reach its AI provider.",
  BLOCKED: "F.A.I. can't answer that request.",
  EMPTY: "F.A.I. didn't get a response from the provider.",
  UPSTREAM: "F.A.I.'s AI provider is temporarily unavailable. Please try again later.",
  BAD_REQUEST: "The request could not be processed."
};

function logFields(req: Request): { method: string; url: string; ip: string | undefined } {
  return { method: req.method, url: req.originalUrl, ip: req.ip };
}

/**
 * Central error handler. Maps known errors to friendly HTTP responses.
 * Never leaks stack traces to the client.
 */
export function createErrorHandler(logger: Logger) {
  return (error: unknown, req: Request, res: Response, _next: NextFunction): void => {
    if (error instanceof HttpError) {
      logger.warn({ ...logFields(req), code: error.code }, "request rejected");
      res.status(error.status).json({ error: { code: error.code, message: error.message } });
      return;
    }

    if (error instanceof GeminiServiceError) {
      logger.warn({ ...logFields(req), code: error.code }, "provider error");
      res.status(GEMINI_STATUS[error.code]).json({
        error: { code: error.code, message: GEMINI_MESSAGE[error.code] }
      });
      return;
    }

    if (isBodySyntaxError(error)) {
      logger.warn(logFields(req), "malformed JSON body");
      res.status(400).json({ error: { code: "VALIDATION", message: "Malformed JSON in request body." } });
      return;
    }

    logger.error({ err: error, ...logFields(req) }, "unhandled error");
    res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong. Please try again later." } });
  };
}
