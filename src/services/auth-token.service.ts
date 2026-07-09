import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { AuthUser } from "./auth.service.js";

export async function signAccessToken(
  user: AuthUser,
  secret: string,
  ttlMinutes: number,
) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${ttlMinutes}m`)
    .sign(secretKey(secret));
}

export async function verifyAccessToken(token: string | undefined, secret: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(secret));
    return {
      id: Number(payload.id),
      username: String(payload.username),
      name: String(payload.name),
      email: String(payload.email),
      phoneNumber: String(payload.phoneNumber),
    } satisfies AuthUser;
  } catch {
    return null;
  }
}

export function createRefreshTokenValue() {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

function secretKey(secret: string) {
  return new TextEncoder().encode(secret);
}
