import type { Request, Response } from "express";
import { sendSuccess } from "../lib/api-response.js";
import {
  createSubstitute,
  deleteSubstitute,
  listSubstitutes,
  updateSubstitute,
} from "../services/substitutes.service.js";

export async function getSubstitutes(_req: Request, res: Response) {
  sendSuccess(res, await listSubstitutes());
}

export async function postSubstitute(req: Request, res: Response) {
  sendSuccess(res, await createSubstitute(req.body), 201);
}

export async function patchSubstitute(req: Request, res: Response) {
  sendSuccess(res, await updateSubstitute(Number(req.params.id), req.body));
}

export async function removeSubstitute(req: Request, res: Response) {
  sendSuccess(res, await deleteSubstitute(Number(req.params.id)));
}
