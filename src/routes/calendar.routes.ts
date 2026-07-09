import { Router } from "express";
import { getCalendar } from "../controllers/calendar.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { calendarSummaryQuerySchema } from "../schemas/scheduling.schemas.js";

export const calendarRouter = Router();

calendarRouter.get(
  "/summary",
  validateRequest({ query: calendarSummaryQuerySchema }),
  asyncHandler(getCalendar),
);
