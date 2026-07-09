import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  communities,
  substituteAssignmentExceptions,
  substituteAssignments,
} from "../db/schema.js";
import { AppError } from "../lib/api-response.js";
import { compareCalendarDates } from "../lib/calendar-date.js";
import { runDatabaseOperation } from "../lib/db-operation.js";
import type {
  assignmentCreateSchema,
  assignmentExceptionCreateSchema,
  assignmentUpdateSchema,
  calendarSummaryQuerySchema,
} from "../schemas/scheduling.schemas.js";
import { assertDateInsideAssignment } from "./day.service.js";
import { getSubstitute } from "./substitutes.service.js";
import type { z } from "zod";

type AssignmentCreate = z.infer<typeof assignmentCreateSchema>;
type AssignmentUpdate = z.infer<typeof assignmentUpdateSchema>;
type AssignmentExceptionCreate = z.infer<typeof assignmentExceptionCreateSchema>;
type RangeQuery = z.infer<typeof calendarSummaryQuerySchema>;

export async function listAssignments(range?: RangeQuery) {
  return runDatabaseOperation(() =>
    db
      .select()
      .from(substituteAssignments)
      .where(
        range
          ? and(
              lte(substituteAssignments.startDate, range.endDate),
              gte(substituteAssignments.endDate, range.startDate),
            )
          : undefined,
      )
      .orderBy(asc(substituteAssignments.startDate), asc(substituteAssignments.substituteName)),
  );
}

export async function createAssignment(input: AssignmentCreate) {
  return runDatabaseOperation(async () => {
    await assertCommunityExists(input.communityId);
    const substituteName = await resolveSubstituteName(input);
    const [created] = await db
      .insert(substituteAssignments)
      .values({ ...input, substituteName })
      .returning();

    return created;
  });
}

export async function updateAssignment(id: number, input: AssignmentUpdate) {
  return runDatabaseOperation(async () => {
    const existing = await getAssignment(id);
    const nextStartDate = input.startDate ?? existing.startDate;
    const nextEndDate = input.endDate ?? existing.endDate;
    if (input.communityId) await assertCommunityExists(input.communityId);

    if (compareCalendarDates(nextStartDate, nextEndDate) > 0) {
      throw new AppError(
        400,
        "DATE_RANGE_INVALID",
        "Start date must be before or equal to end date.",
      );
    }

    const substituteName =
      input.substituteId !== undefined || input.substituteName !== undefined
        ? await resolveSubstituteName({
            substituteId: input.substituteId ?? undefined,
            substituteName: input.substituteName,
            startDate: nextStartDate,
            endDate: nextEndDate,
          })
        : existing.substituteName;

    const [updated] = await db
      .update(substituteAssignments)
      .set({ ...input, substituteName, updatedAt: new Date() })
      .where(eq(substituteAssignments.id, id))
      .returning();

    return updated;
  });
}

export async function deleteAssignment(id: number) {
  return runDatabaseOperation(async () => {
    const [deleted] = await db
      .delete(substituteAssignments)
      .where(eq(substituteAssignments.id, id))
      .returning();

    if (!deleted) {
      throw new AppError(404, "RESOURCE_NOT_FOUND", "Assignment not found.");
    }

    return deleted;
  });
}

export async function createAssignmentException(
  assignmentId: number,
  input: AssignmentExceptionCreate,
) {
  return runDatabaseOperation(async () => {
    const assignment = await getAssignment(assignmentId);
    assertDateInsideAssignment(input.date, assignment);

    const [existing] = await db
      .select()
      .from(substituteAssignmentExceptions)
      .where(
        and(
          eq(substituteAssignmentExceptions.substituteAssignmentId, assignmentId),
          eq(substituteAssignmentExceptions.date, input.date),
        ),
      );

    if (existing) {
      const [updated] = await db
        .update(substituteAssignmentExceptions)
        .set({ reason: input.reason, updatedAt: new Date() })
        .where(eq(substituteAssignmentExceptions.id, existing.id))
        .returning();

      return updated;
    }

    const [created] = await db
      .insert(substituteAssignmentExceptions)
      .values({ substituteAssignmentId: assignmentId, ...input })
      .returning();

    return created;
  });
}

export async function deleteAssignmentException(assignmentId: number, date: string) {
  return runDatabaseOperation(async () => {
    const [deleted] = await db
      .delete(substituteAssignmentExceptions)
      .where(
        and(
          eq(substituteAssignmentExceptions.substituteAssignmentId, assignmentId),
          eq(substituteAssignmentExceptions.date, date),
        ),
      )
      .returning();

    if (!deleted) {
      throw new AppError(
        404,
        "RESOURCE_NOT_FOUND",
        "Assignment exception not found.",
      );
    }

    return deleted;
  });
}

async function getAssignment(id: number) {
  const [assignment] = await db
    .select()
    .from(substituteAssignments)
    .where(eq(substituteAssignments.id, id));

  if (!assignment) {
    throw new AppError(404, "RESOURCE_NOT_FOUND", "Assignment not found.");
  }

  return assignment;
}

async function resolveSubstituteName(
  input: Pick<
    AssignmentCreate,
    "substituteId" | "substituteName" | "startDate" | "endDate"
  >,
) {
  if (input.substituteId) {
    const substitute = await getSubstitute(input.substituteId);
    return substitute.name;
  }

  if (input.substituteName?.trim()) return input.substituteName.trim();

  throw new AppError(
    400,
    "VALIDATION_INVALID_INPUT",
    "Select a substitute or enter a one-off replacement name.",
  );
}

async function assertCommunityExists(id: number) {
  const [community] = await db
    .select()
    .from(communities)
    .where(eq(communities.id, id));

  if (!community) {
    throw new AppError(404, "RESOURCE_NOT_FOUND", "Community not found.");
  }
}
