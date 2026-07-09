import assert from "node:assert/strict";
import {
  communityCreateSchema,
  locationCreateSchema,
} from "./reference.schemas.js";

assert.equal(
  locationCreateSchema.safeParse({
    name: "Main Office",
    timezone: "America/Vancouver",
  }).success,
  true,
);

assert.equal(
  locationCreateSchema.safeParse({
    name: "Main Office",
    timezone: "Not/A_Timezone",
  }).success,
  false,
);

assert.equal(
  communityCreateSchema.safeParse({ name: "Kitsumkalum", locationId: 1 }).success,
  true,
);
