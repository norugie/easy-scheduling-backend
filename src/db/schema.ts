import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const calloutStatusEnum = pgEnum("callout_status", [
  "accepted",
  "declined",
  "no_answer",
  "pending",
]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    email: text("email").notNull(),
    phoneNumber: text("phone_number").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_username_uidx").on(table.username)],
);

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("refresh_tokens_token_hash_uidx").on(table.tokenHash),
    index("refresh_tokens_user_id_idx").on(table.userId),
  ],
);

export const locations = pgTable(
  "locations",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    timezone: text("timezone").notNull().default("America/Vancouver"),
    ...timestamps,
  },
  (table) => [uniqueIndex("locations_name_uidx").on(table.name)],
);

export const communities = pgTable(
  "communities",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    locationId: integer("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "restrict" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("communities_name_location_uidx").on(table.name, table.locationId),
    index("communities_location_id_idx").on(table.locationId),
  ],
);

export const substitutes = pgTable(
  "substitutes",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email"),
    phoneNumber: text("phone_number"),
    cellPhone: text("cell_phone"),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index("substitutes_name_idx").on(table.name),
    index("substitutes_active_idx").on(table.active),
  ],
);

export const absenceRanges = pgTable(
  "absence_ranges",
  {
    id: serial("id").primaryKey(),
    personAwayName: text("person_away_name").notNull(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("absence_ranges_dates_idx").on(table.startDate, table.endDate),
    check("absence_ranges_valid_dates", sql`${table.startDate} <= ${table.endDate}`),
  ],
);

export const substituteAssignments = pgTable(
  "substitute_assignments",
  {
    id: serial("id").primaryKey(),
    absenceId: integer("absence_id").references(() => absenceRanges.id, {
      onDelete: "set null",
    }),
    substituteId: integer("substitute_id").references(() => substitutes.id, {
      onDelete: "set null",
    }),
    communityId: integer("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "restrict" }),
    substituteName: text("substitute_name").notNull(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("substitute_assignments_dates_idx").on(table.startDate, table.endDate),
    index("substitute_assignments_absence_idx").on(table.absenceId),
    index("substitute_assignments_substitute_idx").on(table.substituteId),
    index("substitute_assignments_community_idx").on(table.communityId),
    check(
      "substitute_assignments_valid_dates",
      sql`${table.startDate} <= ${table.endDate}`,
    ),
  ],
);

export const substituteAssignmentExceptions = pgTable(
  "substitute_assignment_exceptions",
  {
    id: serial("id").primaryKey(),
    substituteAssignmentId: integer("substitute_assignment_id")
      .notNull()
      .references(() => substituteAssignments.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    reason: text("reason"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("substitute_assignment_exceptions_assignment_date_uidx").on(
      table.substituteAssignmentId,
      table.date,
    ),
    index("substitute_assignment_exceptions_date_idx").on(table.date),
  ],
);

export const dayNotes = pgTable(
  "day_notes",
  {
    id: serial("id").primaryKey(),
    date: date("date", { mode: "string" }).notNull(),
    notes: text("notes").notNull().default(""),
    ...timestamps,
  },
  (table) => [uniqueIndex("day_notes_date_uidx").on(table.date)],
);

export const calloutStatuses = pgTable(
  "callout_statuses",
  {
    id: serial("id").primaryKey(),
    date: date("date", { mode: "string" }).notNull(),
    substituteId: integer("substitute_id")
      .notNull()
      .references(() => substitutes.id, { onDelete: "restrict" }),
    status: calloutStatusEnum("status").notNull().default("pending"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("callout_statuses_date_substitute_uidx").on(
      table.date,
      table.substituteId,
    ),
    index("callout_statuses_date_idx").on(table.date),
  ],
);
