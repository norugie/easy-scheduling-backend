import type { Request, Response } from "express";
import { sendSuccess } from "../lib/api-response.js";
import {
  createCommunity,
  createLocation,
  deleteCommunity,
  deleteLocation,
  listCommunities,
  listLocations,
  updateCommunity,
  updateLocation,
} from "../services/references.service.js";

export async function getLocations(_req: Request, res: Response) {
  sendSuccess(res, await listLocations());
}

export async function postLocation(req: Request, res: Response) {
  sendSuccess(res, await createLocation(req.body), 201);
}

export async function patchLocation(req: Request, res: Response) {
  sendSuccess(res, await updateLocation(Number(req.params.id), req.body));
}

export async function removeLocation(req: Request, res: Response) {
  sendSuccess(res, await deleteLocation(Number(req.params.id)));
}

export async function getCommunities(_req: Request, res: Response) {
  sendSuccess(res, await listCommunities());
}

export async function postCommunity(req: Request, res: Response) {
  sendSuccess(res, await createCommunity(req.body), 201);
}

export async function patchCommunity(req: Request, res: Response) {
  sendSuccess(res, await updateCommunity(Number(req.params.id), req.body));
}

export async function removeCommunity(req: Request, res: Response) {
  sendSuccess(res, await deleteCommunity(Number(req.params.id)));
}
