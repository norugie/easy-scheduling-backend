import { Router } from "express";
import { getCallouts, patchCallout } from "../controllers/callouts.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  calloutParamSchema,
  calloutQuerySchema,
  calloutStatusUpdateSchema,
} from "../schemas/scheduling.schemas.js";

export const calloutsRouter = Router();

calloutsRouter.get(
  "/",
  validateRequest({ query: calloutQuerySchema }),
  asyncHandler(getCallouts),
);
calloutsRouter.patch(
  "/:date/:substituteId",
  validateRequest({
    body: calloutStatusUpdateSchema,
    params: calloutParamSchema,
  }),
  asyncHandler(patchCallout),
);
