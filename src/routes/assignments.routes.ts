import { Router } from "express";
import {
  getAssignments,
  patchAssignment,
  postAssignment,
  postAssignmentException,
  removeAssignment,
  removeAssignmentException,
} from "../controllers/assignments.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  assignmentCreateSchema,
  assignmentExceptionCreateSchema,
  assignmentExceptionParamSchema,
  assignmentUpdateSchema,
  idParamSchema,
  optionalRangeQuerySchema,
} from "../schemas/scheduling.schemas.js";

export const assignmentsRouter = Router();

assignmentsRouter.get(
  "/",
  validateRequest({ query: optionalRangeQuerySchema }),
  asyncHandler(getAssignments),
);
assignmentsRouter.post(
  "/",
  validateRequest({ body: assignmentCreateSchema }),
  asyncHandler(postAssignment),
);
assignmentsRouter.patch(
  "/:id",
  validateRequest({ body: assignmentUpdateSchema, params: idParamSchema }),
  asyncHandler(patchAssignment),
);
assignmentsRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  asyncHandler(removeAssignment),
);
assignmentsRouter.post(
  "/:id/exceptions",
  validateRequest({
    body: assignmentExceptionCreateSchema,
    params: idParamSchema,
  }),
  asyncHandler(postAssignmentException),
);
assignmentsRouter.delete(
  "/:id/exceptions/:date",
  validateRequest({ params: assignmentExceptionParamSchema }),
  asyncHandler(removeAssignmentException),
);
