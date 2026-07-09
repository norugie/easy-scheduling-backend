import assert from "node:assert/strict";
import { z } from "zod";
import { validateRequest } from "./validate.middleware.js";

const middleware = validateRequest({
  body: z.object({
    name: z.string().min(1),
  }),
});

let statusCode = 200;
let payload: unknown;

await new Promise<void>((resolve, reject) => {
  middleware(
    { body: { name: "" } } as never,
    {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(body: unknown) {
        payload = body;
        resolve();
        return this;
      },
    } as never,
    reject,
  );
});

assert.equal(statusCode, 400);
assert.deepEqual(payload, {
  success: false,
  error: {
    code: "VALIDATION_INVALID_INPUT",
    message: "The request payload is invalid.",
    details: [
      {
        path: ["name"],
        message: "Too small: expected string to have >=1 characters",
      },
    ],
  },
});

let nextCalled = false;

await new Promise<void>((resolve, reject) => {
  middleware(
    { body: { name: "Ada" } } as never,
    {} as never,
    (error?: unknown) => {
      if (error) {
        reject(error);
        return;
      }
      nextCalled = true;
      resolve();
    },
  );
});

assert.equal(nextCalled, true);
