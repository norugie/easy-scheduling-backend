import type { Response } from "express";

export type ErrorCode =
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_UNAUTHORIZED"
  | "VALIDATION_INVALID_INPUT"
  | "RESOURCE_NOT_FOUND"
  | "DATABASE_OPERATION_FAILED"
  | "CONFIG_MISSING_ENV"
  | "CALLOUT_STATUS_INVALID"
  | "DATE_RANGE_INVALID";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export function sendSuccess<T>(res: Response, data: T, status = 200) {
  res.status(status).json({ success: true, data });
}

export function sendError(
  res: Response,
  status: number,
  code: ErrorCode,
  message: string,
  details?: unknown,
) {
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  });
}
