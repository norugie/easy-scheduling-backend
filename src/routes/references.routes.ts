import { Router } from "express";
import {
  getCommunities,
  getLocations,
  patchCommunity,
  patchLocation,
  postCommunity,
  postLocation,
  removeCommunity,
  removeLocation,
} from "../controllers/references.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  communityCreateSchema,
  communityUpdateSchema,
  locationCreateSchema,
  locationUpdateSchema,
} from "../schemas/reference.schemas.js";
import { idParamSchema } from "../schemas/scheduling.schemas.js";

export const locationsRouter = Router();
export const communitiesRouter = Router();

locationsRouter.get("/", asyncHandler(getLocations));
locationsRouter.post(
  "/",
  validateRequest({ body: locationCreateSchema }),
  asyncHandler(postLocation),
);
locationsRouter.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: locationUpdateSchema }),
  asyncHandler(patchLocation),
);
locationsRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  asyncHandler(removeLocation),
);

communitiesRouter.get("/", asyncHandler(getCommunities));
communitiesRouter.post(
  "/",
  validateRequest({ body: communityCreateSchema }),
  asyncHandler(postCommunity),
);
communitiesRouter.patch(
  "/:id",
  validateRequest({ params: idParamSchema, body: communityUpdateSchema }),
  asyncHandler(patchCommunity),
);
communitiesRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  asyncHandler(removeCommunity),
);
