import type { Request, Response } from "express";
import { sendSuccess } from "../lib/api-response.js";
import {
  createAbsence,
  deleteAbsence,
  listAbsences,
  updateAbsence,
} from "../services/absences.service.js";

export async function getAbsences(req: Request, res: Response) {
  const range =
    typeof req.query.startDate === "string" &&
    typeof req.query.endDate === "string"
      ? { startDate: req.query.startDate, endDate: req.query.endDate }
      : undefined;

  sendSuccess(res, await listAbsences(range));
}

export async function postAbsence(req: Request, res: Response) {
  sendSuccess(res, await createAbsence(req.body), 201);
}

export async function patchAbsence(req: Request, res: Response) {
  sendSuccess(res, await updateAbsence(Number(req.params.id), req.body));
}

export async function removeAbsence(req: Request, res: Response) {
  sendSuccess(res, await deleteAbsence(Number(req.params.id)));
}
