import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (req, res, next) => {
    for (const [key, schema] of Object.entries(schemas)) {
      if (!schema) continue;

      const result = schema.safeParse(req[key as keyof RequestSchemas]);

      if (!result.success) {
        res.status(400).json({
          error: "Validation failed",
          issues: result.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        });
        return;
      }

      req[key as "body" | "params" | "query"] = result.data;
    }

    next();
  };
}
