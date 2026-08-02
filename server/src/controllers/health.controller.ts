import type { Request, Response } from "express";
import type { AppConfig } from "../types/config.js";
import type { HealthResponse } from "../types/chat.js";

export class HealthController {
  private readonly startedAt: number;

  constructor(private readonly config: AppConfig) {
    this.startedAt = Date.now();
  }

  handle(_req: Request, res: Response): void {
    const body: HealthResponse = {
      status: "ok",
      uptime: Math.round(process.uptime()),
      version: this.config.version,
      environment: this.config.env
    };
    res.json(body);
  }

  get uptimeSeconds(): number {
    return Math.round((Date.now() - this.startedAt) / 1000);
  }
}
