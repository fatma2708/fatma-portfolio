import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";
import { ZodError } from "zod";
import { HttpError } from "../utils/http.js";

function formatIssues(error: ZodError): string {
  return error.issues
    .map(issue => `${issue.path.join(".") || "body"}: ${issue.message}`)
    .join("; ");
}

/**
 * Validates the JSON body against a zod schema.
 * Rejects empty/oversized messages, invalid JSON, wrong types.
 */
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new HttpError(400, "VALIDATION", `Invalid request body: ${formatIssues(result.error)}`));
      return;
    }

    req.body = result.data;
    next();
  };
}
