import { Router } from "express";
import {
  getSubstitutes,
  patchSubstitute,
  postSubstitute,
  removeSubstitute,
} from "../controllers/substitutes.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  idParamSchema,
  substituteCreateSchema,
  substituteUpdateSchema,
} from "../schemas/scheduling.schemas.js";

export const substitutesRouter = Router();

substitutesRouter.get("/", asyncHandler(getSubstitutes));
substitutesRouter.post(
  "/",
  validateRequest({ body: substituteCreateSchema }),
  asyncHandler(postSubstitute),
);
substitutesRouter.patch(
  "/:id",
  validateRequest({ body: substituteUpdateSchema, params: idParamSchema }),
  asyncHandler(patchSubstitute),
);
substitutesRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  asyncHandler(removeSubstitute),
);
