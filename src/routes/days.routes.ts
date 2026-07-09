import { Router } from "express";
import { getDay, putDayNotes } from "../controllers/days.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  dateParamSchema,
  dayNotesUpdateSchema,
} from "../schemas/scheduling.schemas.js";

export const daysRouter = Router();

daysRouter.get(
  "/:date",
  validateRequest({ params: dateParamSchema }),
  asyncHandler(getDay),
);
daysRouter.put(
  "/:date/notes",
  validateRequest({ body: dayNotesUpdateSchema, params: dateParamSchema }),
  asyncHandler(putDayNotes),
);
