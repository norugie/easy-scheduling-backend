import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "./password.service.js";

const hash = await hashPassword("password");

assert.equal(hash.includes("password"), false);
assert.equal(await verifyPassword("password", hash), true);
assert.equal(await verifyPassword("wrong", hash), false);
