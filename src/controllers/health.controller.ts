import type { Request, Response } from "express";
import { sendSuccess } from "../lib/api-response.js";
import { getHealthStatus } from "../services/health.service.js";

export function getHealth(_req: Request, res: Response) {
  sendSuccess(res, getHealthStatus());
}
