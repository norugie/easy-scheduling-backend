import { z } from "zod";

const trimmedString = z.string().trim().min(1);

export const timezoneSchema = z.string().refine(isValidTimezone, {
  message: "Timezone must be a valid IANA timezone.",
});

export const locationCreateSchema = z
  .object({
    name: trimmedString,
    timezone: timezoneSchema.default("America/Vancouver"),
  })
  .strict();

export const locationUpdateSchema = locationCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

export const communityCreateSchema = z
  .object({
    name: trimmedString,
    locationId: z.number().int().positive(),
  })
  .strict();

export const communityUpdateSchema = communityCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

function isValidTimezone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
