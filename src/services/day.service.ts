import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  absenceRanges,
  calloutStatuses,
  dayNotes,
  substitutes,
  substituteAssignmentExceptions,
  substituteAssignments,
} from "../db/schema.js";
import { AppError } from "../lib/api-response.js";
import { isDateInRange } from "../lib/calendar-date.js";
import { splitAssignmentsForDate } from "../lib/day-detail.js";
import { runDatabaseOperation } from "../lib/db-operation.js";

type AssignmentForDate = {
  id: number;
  startDate: string;
  endDate: string;
};

export async function getDayDetail(date: string) {
  return runDatabaseOperation(async () => {
    const [note] = await db
      .select()
      .from(dayNotes)
      .where(eq(dayNotes.date, date));

    const absences = await db
      .select()
      .from(absenceRanges)
      .where(
        and(lte(absenceRanges.startDate, date), gte(absenceRanges.endDate, date)),
      );

    const assignmentRows = await db
      .select()
      .from(substituteAssignments)
      .where(
        and(
          lte(substituteAssignments.startDate, date),
          gte(substituteAssignments.endDate, date),
        ),
      );

    const exceptions = assignmentRows.length
      ? await db
          .select()
          .from(substituteAssignmentExceptions)
          .where(
            and(
              eq(substituteAssignmentExceptions.date, date),
              inArray(
                substituteAssignmentExceptions.substituteAssignmentId,
                assignmentRows.map((assignment) => assignment.id),
              ),
            ),
          )
      : [];

    const callouts = await db
      .select({
        id: calloutStatuses.id,
        date: calloutStatuses.date,
        substituteId: calloutStatuses.substituteId,
        status: calloutStatuses.status,
        notes: calloutStatuses.notes,
        createdAt: calloutStatuses.createdAt,
        updatedAt: calloutStatuses.updatedAt,
        substituteName: substitutes.name,
      })
      .from(calloutStatuses)
      .innerJoin(substitutes, eq(calloutStatuses.substituteId, substitutes.id))
      .where(eq(calloutStatuses.date, date));

    return {
      date,
      notes: note?.notes ?? "",
      absences,
      ...splitAssignmentsForDate(assignmentRows, exceptions),
      callouts,
    };
  });
}

export async function updateDayNotes(date: string, notes: string) {
  return runDatabaseOperation(async () => {
    const [existing] = await db
      .select()
      .from(dayNotes)
      .where(eq(dayNotes.date, date));

    if (existing) {
      const [updated] = await db
        .update(dayNotes)
        .set({ notes, updatedAt: new Date() })
        .where(eq(dayNotes.date, date))
        .returning();

      return updated;
    }

    const [created] = await db
      .insert(dayNotes)
      .values({ date, notes })
      .returning();

    return created;
  });
}

export function assertDateInsideAssignment(
  date: string,
  assignment: AssignmentForDate,
) {
  if (!isDateInRange(date, assignment.startDate, assignment.endDate)) {
    throw new AppError(
      400,
      "DATE_RANGE_INVALID",
      "The exception date must be inside the assignment range.",
    );
  }
}
