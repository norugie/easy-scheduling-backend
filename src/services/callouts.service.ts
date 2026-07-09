import { and, asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { calloutStatuses, substitutes } from "../db/schema.js";
import { AppError } from "../lib/api-response.js";
import { runDatabaseOperation } from "../lib/db-operation.js";
import type { calloutStatusUpdateSchema } from "../schemas/scheduling.schemas.js";
import type { z } from "zod";

type CalloutStatusUpdate = z.infer<typeof calloutStatusUpdateSchema>;

export async function listCalloutsForDate(date: string) {
  return runDatabaseOperation(async () => {
    const [substituteRows, statusRows] = await Promise.all([
      db.select().from(substitutes).orderBy(asc(substitutes.name)),
      db.select().from(calloutStatuses).where(eq(calloutStatuses.date, date)),
    ]);

    const statusesBySubstituteId = new Map(
      statusRows.map((status) => [status.substituteId, status]),
    );

    return substituteRows.map((substitute) => ({
      substitute,
      status:
        statusesBySubstituteId.get(substitute.id)?.status ?? ("pending" as const),
      notes: statusesBySubstituteId.get(substitute.id)?.notes ?? null,
      calloutId: statusesBySubstituteId.get(substitute.id)?.id ?? null,
    }));
  });
}

export async function updateCalloutStatus(
  date: string,
  substituteId: number,
  input: CalloutStatusUpdate,
) {
  return runDatabaseOperation(async () => {
    const [substitute] = await db
      .select()
      .from(substitutes)
      .where(eq(substitutes.id, substituteId));

    if (!substitute) {
      throw new AppError(404, "RESOURCE_NOT_FOUND", "Substitute not found.");
    }

    const [matching] = await db
      .select()
      .from(calloutStatuses)
      .where(
        and(
          eq(calloutStatuses.date, date),
          eq(calloutStatuses.substituteId, substituteId),
        ),
      );

    if (matching) {
      const [updated] = await db
        .update(calloutStatuses)
        .set({
          status: input.status,
          notes: input.notes,
          updatedAt: new Date(),
        })
        .where(eq(calloutStatuses.id, matching.id))
        .returning();

      return updated;
    }

    const [created] = await db
      .insert(calloutStatuses)
      .values({
        date,
        substituteId,
        status: input.status,
        notes: input.notes,
      })
      .returning();

    return created;
  });
}
