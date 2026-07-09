import type { ErrorRequestHandler } from "express";
import { AppError, sendError } from "../lib/api-response.js";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    sendError(res, err.status, err.code, err.message, err.details);
    return;
  }

  console.error(err);
  sendError(res, 500, "DATABASE_OPERATION_FAILED", "Internal Server Error");
};
