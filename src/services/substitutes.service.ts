import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { substitutes } from "../db/schema.js";
import { AppError } from "../lib/api-response.js";
import { runDatabaseOperation } from "../lib/db-operation.js";
import type {
  substituteCreateSchema,
  substituteUpdateSchema,
} from "../schemas/scheduling.schemas.js";
import type { z } from "zod";

type SubstituteCreate = z.infer<typeof substituteCreateSchema>;
type SubstituteUpdate = z.infer<typeof substituteUpdateSchema>;

export async function listSubstitutes() {
  return runDatabaseOperation(() =>
    db
      .select()
      .from(substitutes)
      .orderBy(asc(substitutes.name)),
  );
}

export async function getSubstitute(id: number) {
  return runDatabaseOperation(async () => {
    const [substitute] = await db
      .select()
      .from(substitutes)
      .where(eq(substitutes.id, id));

    if (!substitute) {
      throw new AppError(404, "RESOURCE_NOT_FOUND", "Substitute not found.");
    }

    return substitute;
  });
}

export async function createSubstitute(input: SubstituteCreate) {
  return runDatabaseOperation(async () => {
    const [created] = await db.insert(substitutes).values(input).returning();
    return created;
  });
}

export async function updateSubstitute(id: number, input: SubstituteUpdate) {
  return runDatabaseOperation(async () => {
    const [updated] = await db
      .update(substitutes)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(substitutes.id, id))
      .returning();

    if (!updated) {
      throw new AppError(404, "RESOURCE_NOT_FOUND", "Substitute not found.");
    }

    return updated;
  });
}

export async function deleteSubstitute(id: number) {
  return runDatabaseOperation(async () => {
    const [deleted] = await db
      .update(substitutes)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(substitutes.id, id))
      .returning();

    if (!deleted) {
      throw new AppError(404, "RESOURCE_NOT_FOUND", "Substitute not found.");
    }

    return deleted;
  });
}
