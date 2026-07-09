import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { refreshTokens, users } from "../db/schema.js";
import { AppError } from "../lib/api-response.js";
import { runDatabaseOperation } from "../lib/db-operation.js";
import {
  createRefreshTokenValue,
  hashRefreshToken,
  signAccessToken,
} from "./auth-token.service.js";
import { verifyPassword } from "./password.service.js";

export type AuthUser = {
  id: number;
  username: string;
  name: string;
  email: string;
  phoneNumber: string;
};

type AuthConfig = {
  JWT_ACCESS_SECRET: string;
  ACCESS_TOKEN_TTL_MINUTES: number;
  REFRESH_TOKEN_TTL_DAYS: number;
};

export async function loginWithPassword(
  username: string,
  password: string,
  config: AuthConfig,
) {
  return runDatabaseOperation(async () => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new AppError(
        401,
        "AUTH_INVALID_CREDENTIALS",
        "The username or password is incorrect.",
      );
    }

    const authUser = toAuthUser(user);
    const refreshToken = await createStoredRefreshToken(authUser.id, config);
    const accessToken = await signAccessToken(
      authUser,
      config.JWT_ACCESS_SECRET,
      config.ACCESS_TOKEN_TTL_MINUTES,
    );

    return { accessToken, refreshToken, user: authUser };
  });
}

export async function rotateRefreshToken(refreshToken: string, config: AuthConfig) {
  return runDatabaseOperation(async () => {
    const tokenHash = hashRefreshToken(refreshToken);
    const [storedToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      );

    if (!storedToken) {
      throw new AppError(401, "AUTH_UNAUTHORIZED", "Authentication is required.");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, storedToken.userId));

    if (!user) {
      throw new AppError(401, "AUTH_UNAUTHORIZED", "Authentication is required.");
    }

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(refreshTokens.id, storedToken.id));

    const authUser = toAuthUser(user);
    const nextRefreshToken = await createStoredRefreshToken(authUser.id, config);
    const accessToken = await signAccessToken(
      authUser,
      config.JWT_ACCESS_SECRET,
      config.ACCESS_TOKEN_TTL_MINUTES,
    );

    return { accessToken, refreshToken: nextRefreshToken, user: authUser };
  });
}

export async function revokeRefreshToken(refreshToken: string | undefined) {
  if (!refreshToken) return;

  await runDatabaseOperation(async () => {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, hashRefreshToken(refreshToken)));
  });
}

async function createStoredRefreshToken(userId: number, config: AuthConfig) {
  const refreshToken = createRefreshTokenValue();
  const expiresAt = new Date(
    Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  await db.insert(refreshTokens).values({
    userId,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt,
  });

  return refreshToken;
}

function toAuthUser(user: typeof users.$inferSelect): AuthUser {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
  };
}
