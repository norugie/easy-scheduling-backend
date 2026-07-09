import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError, sendSuccess } from "../lib/api-response.js";
import {
  loginWithPassword,
  revokeRefreshToken,
  rotateRefreshToken,
} from "../services/auth.service.js";

const refreshCookieOptions = {
  httpOnly: true,
  path: "/api/auth",
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
};

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  const result = await loginWithPassword(username, password, env);

  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, { accessToken: result.accessToken, user: result.user });
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = readCookie(req.headers.cookie, env.REFRESH_COOKIE_NAME);

  if (!refreshToken) {
    throw new AppError(401, "AUTH_UNAUTHORIZED", "Authentication is required.");
  }

  const result = await rotateRefreshToken(refreshToken, env);
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, { accessToken: result.accessToken, user: result.user });
}

export async function logout(req: Request, res: Response) {
  await revokeRefreshToken(readCookie(req.headers.cookie, env.REFRESH_COOKIE_NAME));
  res.clearCookie(env.REFRESH_COOKIE_NAME, refreshCookieOptions);
  sendSuccess(res, { authenticated: false });
}

export function me(req: Request, res: Response) {
  if (!req.auth) {
    throw new AppError(401, "AUTH_UNAUTHORIZED", "Authentication is required.");
  }

  sendSuccess(res, { user: req.auth });
}

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, {
    ...refreshCookieOptions,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

function readCookie(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return undefined;

  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...valueParts] = cookie.trim().split("=");
    if (rawName !== name) continue;

    try {
      return decodeURIComponent(valueParts.join("="));
    } catch {
      return valueParts.join("=");
    }
  }

  return undefined;
}
