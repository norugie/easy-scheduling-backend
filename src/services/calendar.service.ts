import { and, gte, lte, ne } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  absenceRanges,
  calloutStatuses,
  substituteAssignmentExceptions,
  substituteAssignments,
} from "../db/schema.js";
import { eachCalendarDate } from "../lib/calendar-date.js";
import { runDatabaseOperation } from "../lib/db-operation.js";

type CalendarDaySummary = {
  date: string;
  hasAbsence: boolean;
  hasAssignment: boolean;
  hasCanceledAssignment: boolean;
  hasCallout: boolean;
  awayPeople: string[];
};

export async function getCalendarSummary(startDate: string, endDate: string) {
  return runDatabaseOperation(async () => {
    const [absences, assignments, exceptions, callouts] = await Promise.all([
      db
        .select()
        .from(absenceRanges)
        .where(
          and(
            lte(absenceRanges.startDate, endDate),
            gte(absenceRanges.endDate, startDate),
          ),
        ),
      db
        .select()
        .from(substituteAssignments)
        .where(
          and(
            lte(substituteAssignments.startDate, endDate),
            gte(substituteAssignments.endDate, startDate),
          ),
        ),
      db
        .select()
        .from(substituteAssignmentExceptions)
        .where(
          and(
            gte(substituteAssignmentExceptions.date, startDate),
            lte(substituteAssignmentExceptions.date, endDate),
          ),
        ),
      db
        .select()
        .from(calloutStatuses)
        .where(
          and(
            gte(calloutStatuses.date, startDate),
            lte(calloutStatuses.date, endDate),
            ne(calloutStatuses.status, "pending"),
          ),
        ),
    ]);

    return buildCalendarSummary({
      startDate,
      endDate,
      absences,
      assignments,
      exceptions,
      callouts,
    });
  });
}

export function buildCalendarSummary({
  startDate,
  endDate,
  absences,
  assignments,
  exceptions,
  callouts,
}: {
  startDate: string;
  endDate: string;
  absences: { personAwayName: string; startDate: string; endDate: string }[];
  assignments: { startDate: string; endDate: string }[];
  exceptions: { date: string }[];
  callouts: { date: string }[];
}) {
  const byDate = new Map<string, CalendarDaySummary>();
  const awayPeopleByDate = new Map<string, Set<string>>();
  const get = (date: string) => {
    const existing = byDate.get(date);
    if (existing) return existing;

    const summary = {
      date,
      hasAbsence: false,
      hasAssignment: false,
      hasCanceledAssignment: false,
      hasCallout: false,
      awayPeople: [],
    };
    byDate.set(date, summary);
    return summary;
  };

  for (const absence of absences) {
    for (const date of eachCalendarDate(
      maxDate(absence.startDate, startDate),
      minDate(absence.endDate, endDate),
    )) {
      const summary = get(date);
      summary.hasAbsence = true;
      const names = awayPeopleByDate.get(date) ?? new Set<string>();
      names.add(absence.personAwayName);
      awayPeopleByDate.set(date, names);
    }
  }

  for (const assignment of assignments) {
    for (const date of eachCalendarDate(
      maxDate(assignment.startDate, startDate),
      minDate(assignment.endDate, endDate),
    )) {
      get(date).hasAssignment = true;
    }
  }

  for (const exception of exceptions) {
    get(exception.date).hasCanceledAssignment = true;
  }

  for (const callout of callouts) {
    get(callout.date).hasCallout = true;
  }

  for (const [date, names] of awayPeopleByDate) {
    get(date).awayPeople = Array.from(names).sort((left, right) =>
      left.localeCompare(right),
    );
  }

  return Array.from(byDate.values()).sort((left, right) =>
    left.date.localeCompare(right.date),
  );
}

function maxDate(left: string, right: string) {
  return left.localeCompare(right) > 0 ? left : right;
}

function minDate(left: string, right: string) {
  return left.localeCompare(right) < 0 ? left : right;
}
