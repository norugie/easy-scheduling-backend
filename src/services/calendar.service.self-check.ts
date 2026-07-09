import assert from "node:assert/strict";
import { buildCalendarSummary } from "./calendar.service.js";

const summary = buildCalendarSummary({
  startDate: "2026-07-01",
  endDate: "2026-07-03",
  absences: [
    {
      personAwayName: "Zoe",
      startDate: "2026-07-01",
      endDate: "2026-07-03",
    },
    {
      personAwayName: "Amy",
      startDate: "2026-07-02",
      endDate: "2026-07-02",
    },
    {
      personAwayName: "Zoe",
      startDate: "2026-07-02",
      endDate: "2026-07-02",
    },
  ],
  assignments: [],
  exceptions: [],
  callouts: [],
});

assert.deepEqual(summary, [
  {
    date: "2026-07-01",
    hasAbsence: true,
    hasAssignment: false,
    hasCanceledAssignment: false,
    hasCallout: false,
    awayPeople: ["Zoe"],
  },
  {
    date: "2026-07-02",
    hasAbsence: true,
    hasAssignment: false,
    hasCanceledAssignment: false,
    hasCallout: false,
    awayPeople: ["Amy", "Zoe"],
  },
  {
    date: "2026-07-03",
    hasAbsence: true,
    hasAssignment: false,
    hasCanceledAssignment: false,
    hasCallout: false,
    awayPeople: ["Zoe"],
  },
]);
