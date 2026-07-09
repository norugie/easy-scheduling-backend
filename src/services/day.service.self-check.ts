import assert from "node:assert/strict";
import { splitAssignmentsForDate } from "../lib/day-detail.js";

const assignments = [
  { id: 1, substituteName: "Grace", startDate: "2026-06-01", endDate: "2026-06-10" },
  { id: 2, substituteName: "Katherine", startDate: "2026-06-05", endDate: "2026-06-05" },
];

const result = splitAssignmentsForDate(assignments, [
  { substituteAssignmentId: 1, date: "2026-06-05", reason: "Unavailable" },
]);

assert.deepEqual(
  result.assignments.map((assignment) => assignment.id),
  [2],
);
assert.deepEqual(
  result.canceledAssignments.map((assignment) => assignment.id),
  [1],
);
