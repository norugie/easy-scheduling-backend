import { z } from "zod";
import {
  calendarDaysBetween,
  compareCalendarDates,
  isCalendarDate,
} from "../lib/calendar-date.js";

const trimmedString = z.string().trim().min(1);
const nullableContact = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().trim().min(1).nullable().optional(),
);

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isCalendarDate, "Invalid calendar date.");

export const dateParamSchema = z.object({
  date: dateStringSchema,
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const assignmentExceptionParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  date: dateStringSchema,
});

const dateRange = {
  startDate: dateStringSchema,
  endDate: dateStringSchema,
};

function validRange<T extends { startDate: string; endDate: string }>(value: T) {
  return compareCalendarDates(value.startDate, value.endDate) <= 0;
}

export const calendarSummaryQuerySchema = z
  .object(dateRange)
  .refine(validRange, {
    message: "Start date must be before or equal to end date.",
    path: ["endDate"],
  })
  .refine((value) => calendarDaysBetween(value.startDate, value.endDate) <= 370, {
    message: "Calendar summary ranges cannot exceed 370 days.",
    path: ["endDate"],
  });

export const optionalRangeQuerySchema = z
  .object({
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
  })
  .refine((value) => Boolean(value.startDate) === Boolean(value.endDate), {
    message: "Both startDate and endDate are required for range queries.",
    path: ["endDate"],
  })
  .refine(
    (value) =>
      !value.startDate ||
      !value.endDate ||
      compareCalendarDates(value.startDate, value.endDate) <= 0,
    {
      message: "Start date must be before or equal to end date.",
      path: ["endDate"],
    },
  );

export const substituteCreateSchema = z
  .object({
    name: trimmedString,
    email: z.preprocess(
      (value) => (value === "" ? null : value),
      z.string().trim().email().nullable().optional(),
    ),
    phoneNumber: nullableContact,
    cellPhone: nullableContact,
    active: z.boolean().optional().default(true),
  })
  .strict();

export const substituteUpdateSchema = substituteCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

const absenceBaseSchema = z.object({
  personAwayName: trimmedString,
  ...dateRange,
  notes: z.string().trim().optional().nullable(),
});

export const absenceCreateSchema = absenceBaseSchema.refine(validRange, {
    message: "Start date must be before or equal to end date.",
    path: ["endDate"],
  });

export const absenceUpdateSchema = absenceBaseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

const assignmentBaseSchema = z.object({
  absenceId: z.number().int().positive().optional().nullable(),
  substituteId: z.number().int().positive().optional().nullable(),
  communityId: z.number().int().positive(),
  substituteName: z.string().trim().optional(),
  ...dateRange,
  notes: z.string().trim().optional().nullable(),
}).strict();

export const assignmentCreateSchema = assignmentBaseSchema
  .refine(validRange, {
    message: "Start date must be before or equal to end date.",
    path: ["endDate"],
  })
  .refine(
    (value) => Boolean(value.substituteId || value.substituteName?.trim()),
    {
      message: "Select a substitute or enter a one-off replacement name.",
      path: ["substituteName"],
    },
  );

export const assignmentUpdateSchema = assignmentBaseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

export const assignmentExceptionCreateSchema = z.object({
  date: dateStringSchema,
  reason: z.string().trim().optional().nullable(),
});

export const dayNotesUpdateSchema = z.object({
  notes: z.string().trim(),
});

export const calloutQuerySchema = z.object({
  date: dateStringSchema,
});

export const calloutParamSchema = z.object({
  date: dateStringSchema,
  substituteId: z.coerce.number().int().positive(),
});

export const calloutStatusUpdateSchema = z.object({
  status: z.enum(["accepted", "declined", "no_answer", "pending"]),
  notes: z.string().trim().optional().nullable(),
});
