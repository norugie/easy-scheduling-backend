import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { sendError } from "../lib/api-response.js";

type RequestSchemas = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (req, res, next) => {
    for (const [key, schema] of Object.entries(schemas)) {
      if (!schema) continue;

      const result = schema.safeParse(req[key as keyof RequestSchemas]);

      if (!result.success) {
        sendError(
          res,
          400,
          "VALIDATION_INVALID_INPUT",
          "The request payload is invalid.",
          result.error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
        );
        return;
      }

      if (key === "query") {
        const queryData = result.data as Record<string, unknown>;
        for (const [qk, qv] of Object.entries(queryData)) {
          (req.query as Record<string, unknown>)[qk] = qv;
        }
        continue;
      }

      // body/params path remains as before
      req[key as "body" | "params"] = result.data as never;
    }

    next();
  };
}