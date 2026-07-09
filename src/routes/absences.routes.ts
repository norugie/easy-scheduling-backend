import { Router } from "express";
import {
  getAbsences,
  patchAbsence,
  postAbsence,
  removeAbsence,
} from "../controllers/absences.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  absenceCreateSchema,
  absenceUpdateSchema,
  idParamSchema,
  optionalRangeQuerySchema,
} from "../schemas/scheduling.schemas.js";

export const absencesRouter = Router();

absencesRouter.get(
  "/",
  validateRequest({ query: optionalRangeQuerySchema }),
  asyncHandler(getAbsences),
);
absencesRouter.post(
  "/",
  validateRequest({ body: absenceCreateSchema }),
  asyncHandler(postAbsence),
);
absencesRouter.patch(
  "/:id",
  validateRequest({ body: absenceUpdateSchema, params: idParamSchema }),
  asyncHandler(patchAbsence),
);
absencesRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  asyncHandler(removeAbsence),
);
