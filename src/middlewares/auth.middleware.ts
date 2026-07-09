import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { AppError } from "../lib/api-response.js";
import { verifyAccessToken } from "../services/auth-token.service.js";

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const token = readBearerToken(req.headers.authorization);
  const user = await verifyAccessToken(token, env.JWT_ACCESS_SECRET);

  if (!user) {
    next(new AppError(401, "AUTH_UNAUTHORIZED", "Authentication is required."));
    return;
  }

  req.auth = user;
  next();
};

function readBearerToken(value: string | undefined) {
  if (!value?.startsWith("Bearer ")) return undefined;
  return value.slice("Bearer ".length);
}
