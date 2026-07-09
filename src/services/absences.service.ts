import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "../db/index.js";
import { absenceRanges } from "../db/schema.js";
import { AppError } from "../lib/api-response.js";
import { compareCalendarDates } from "../lib/calendar-date.js";
import { runDatabaseOperation } from "../lib/db-operation.js";
import type {
  absenceCreateSchema,
  absenceUpdateSchema,
  calendarSummaryQuerySchema,
} from "../schemas/scheduling.schemas.js";
import type { z } from "zod";

type AbsenceCreate = z.infer<typeof absenceCreateSchema>;
type AbsenceUpdate = z.infer<typeof absenceUpdateSchema>;
type RangeQuery = z.infer<typeof calendarSummaryQuerySchema>;

export async function listAbsences(range?: RangeQuery) {
  return runDatabaseOperation(() =>
    db
      .select()
      .from(absenceRanges)
      .where(
        range
          ? and(
              lte(absenceRanges.startDate, range.endDate),
              gte(absenceRanges.endDate, range.startDate),
            )
          : undefined,
      )
      .orderBy(asc(absenceRanges.startDate), asc(absenceRanges.personAwayName)),
  );
}

export async function createAbsence(input: AbsenceCreate) {
  return runDatabaseOperation(async () => {
    const [created] = await db.insert(absenceRanges).values(input).returning();
    return created;
  });
}

export async function updateAbsence(id: number, input: AbsenceUpdate) {
  return runDatabaseOperation(async () => {
    const [existing] = await db
      .select()
      .from(absenceRanges)
      .where(eq(absenceRanges.id, id));

    if (!existing) {
      throw new AppError(404, "RESOURCE_NOT_FOUND", "Absence not found.");
    }

    const nextStartDate = input.startDate ?? existing.startDate;
    const nextEndDate = input.endDate ?? existing.endDate;

    if (compareCalendarDates(nextStartDate, nextEndDate) > 0) {
      throw new AppError(
        400,
        "DATE_RANGE_INVALID",
        "Start date must be before or equal to end date.",
      );
    }

    const [updated] = await db
      .update(absenceRanges)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(absenceRanges.id, id))
      .returning();

    return updated;
  });
}

export async function deleteAbsence(id: number) {
  return runDatabaseOperation(async () => {
    const [deleted] = await db
      .delete(absenceRanges)
      .where(eq(absenceRanges.id, id))
      .returning();

    if (!deleted) {
      throw new AppError(404, "RESOURCE_NOT_FOUND", "Absence not found.");
    }

    return deleted;
  });
}
