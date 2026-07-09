import assert from "node:assert/strict";
import {
  absenceCreateSchema,
  calloutStatusUpdateSchema,
  dateParamSchema,
} from "./scheduling.schemas.js";

assert.equal(
  dateParamSchema.safeParse({ date: "2026-06-05" }).success,
  true,
);

assert.equal(
  dateParamSchema.safeParse({ date: "06/05/2026" }).success,
  false,
);

assert.equal(
  absenceCreateSchema.safeParse({
    personAwayName: "Ada Lovelace",
    startDate: "2026-06-10",
    endDate: "2026-06-01",
  }).success,
  false,
);

assert.equal(
  calloutStatusUpdateSchema.safeParse({ status: "maybe" }).success,
  false,
);

assert.equal(
  absenceCreateSchema.safeParse({
    personAwayName: "Ada Lovelace",
    startDate: "2026-06-01",
    endDate: "2026-06-10",
  }).success,
  true,
);

assert.equal(
  calloutStatusUpdateSchema.safeParse({ status: "accepted", notes: null }).success,
  true,
);

const substituteResult = await import("./scheduling.schemas.js").then(
  ({ substituteCreateSchema }) =>
    substituteCreateSchema.safeParse({
      name: "Grace Hopper",
      email: null,
      phoneNumber: null,
      cellPhone: "+12505550123",
      active: true,
    }),
);

assert.equal(substituteResult.success, true);

const substituteWithTown = await import("./scheduling.schemas.js").then(
  ({ substituteCreateSchema }) =>
    substituteCreateSchema.safeParse({
      name: "Grace Hopper",
      town: "Terrace",
      active: true,
    }),
);

assert.equal(substituteWithTown.success, false);

const assignmentWithoutCommunity = await import("./scheduling.schemas.js").then(
  ({ assignmentCreateSchema }) =>
    assignmentCreateSchema.safeParse({
      substituteId: 1,
      startDate: "2026-06-01",
      endDate: "2026-06-10",
    }),
);

assert.equal(assignmentWithoutCommunity.success, false);
