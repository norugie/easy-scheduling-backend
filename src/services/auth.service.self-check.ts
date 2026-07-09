import assert from "node:assert/strict";
import {
  createRefreshTokenValue,
  hashRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from "./auth-token.service.js";

const secret = "test-secret-with-enough-length-for-jwt-hs256";
const token = await signAccessToken(
  {
    id: 1,
    username: "hr.anderson",
    name: "Richard Anderson",
    email: "3900@cmsd.bc.ca",
    phoneNumber: "+12506414384",
  },
  secret,
  15,
);

assert.deepEqual(await verifyAccessToken(token, secret), {
  id: 1,
  username: "hr.anderson",
  name: "Richard Anderson",
  email: "3900@cmsd.bc.ca",
  phoneNumber: "+12506414384",
});

assert.equal(await verifyAccessToken(`${token}x`, secret), null);

const refreshToken = createRefreshTokenValue();
assert.equal(refreshToken.length > 40, true);
assert.equal(hashRefreshToken(refreshToken), hashRefreshToken(refreshToken));
assert.notEqual(hashRefreshToken(refreshToken), hashRefreshToken(`${refreshToken}x`));
