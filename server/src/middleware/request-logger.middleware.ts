import type { NextFunction, Request, Response } from "express";
import type { Logger } from "pino";

/**
 * Structured request logging. Verbose in development (via the logger),
 * minimal in production. Never logs bodies — only method, url, status, duration, ip.
 */
export function requestLogger(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = performance.now();

    res.on("finish", () => {
      const durationMs = Math.round(performance.now() - start);
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

      logger[level]({
        msg: "http request",
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs,
        ip: req.ip
      });
    });

    next();
  };
}
