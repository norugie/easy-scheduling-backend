import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { communities, locations } from "../db/schema.js";
import { AppError } from "../lib/api-response.js";
import { runDatabaseOperation } from "../lib/db-operation.js";
import type {
  communityCreateSchema,
  communityUpdateSchema,
  locationCreateSchema,
  locationUpdateSchema,
} from "../schemas/reference.schemas.js";
import type { z } from "zod";

type LocationCreate = z.infer<typeof locationCreateSchema>;
type LocationUpdate = z.infer<typeof locationUpdateSchema>;
type CommunityCreate = z.infer<typeof communityCreateSchema>;
type CommunityUpdate = z.infer<typeof communityUpdateSchema>;

export async function listLocations() {
  return runDatabaseOperation(() =>
    db.select().from(locations).orderBy(asc(locations.name)),
  );
}

export async function createLocation(input: LocationCreate) {
  return runDatabaseOperation(async () => {
    const [created] = await db.insert(locations).values(input).returning();
    return created;
  });
}

export async function updateLocation(id: number, input: LocationUpdate) {
  return runDatabaseOperation(async () => {
    const [updated] = await db
      .update(locations)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(locations.id, id))
      .returning();

    if (!updated) {
      throw new AppError(404, "RESOURCE_NOT_FOUND", "Location not found.");
    }

    return updated;
  });
}

export async function deleteLocation(id: number) {
  return runDatabaseOperation(async () => {
    const [deleted] = await db
      .delete(locations)
      .where(eq(locations.id, id))
      .returning();

    if (!deleted) {
      throw new AppError(404, "RESOURCE_NOT_FOUND", "Location not found.");
    }

    return deleted;
  });
}

export async function listCommunities() {
  return runDatabaseOperation(() =>
    db
      .select({
        id: communities.id,
        name: communities.name,
        locationId: communities.locationId,
        createdAt: communities.createdAt,
        updatedAt: communities.updatedAt,
        location: locations,
      })
      .from(communities)
      .innerJoin(locations, eq(communities.locationId, locations.id))
      .orderBy(asc(communities.name)),
  );
}

export async function createCommunity(input: CommunityCreate) {
  return runDatabaseOperation(async () => {
    await assertLocationExists(input.locationId);
    const [created] = await db.insert(communities).values(input).returning();
    return created;
  });
}

export async function updateCommunity(id: number, input: CommunityUpdate) {
  return runDatabaseOperation(async () => {
    if (input.locationId) await assertLocationExists(input.locationId);

    const [updated] = await db
      .update(communities)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(communities.id, id))
      .returning();

    if (!updated) {
      throw new AppError(404, "RESOURCE_NOT_FOUND", "Community not found.");
    }

    return updated;
  });
}

export async function deleteCommunity(id: number) {
  return runDatabaseOperation(async () => {
    const [deleted] = await db
      .delete(communities)
      .where(eq(communities.id, id))
      .returning();

    if (!deleted) {
      throw new AppError(404, "RESOURCE_NOT_FOUND", "Community not found.");
    }

    return deleted;
  });
}

async function assertLocationExists(id: number) {
  const [location] = await db.select().from(locations).where(eq(locations.id, id));
  if (!location) {
    throw new AppError(404, "RESOURCE_NOT_FOUND", "Location not found.");
  }
}
