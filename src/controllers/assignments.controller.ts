import type { Request, Response } from "express";
import { sendSuccess } from "../lib/api-response.js";
import {
  createAssignment,
  createAssignmentException,
  deleteAssignment,
  deleteAssignmentException,
  listAssignments,
  updateAssignment,
} from "../services/assignments.service.js";

export async function getAssignments(req: Request, res: Response) {
  const range =
    typeof req.query.startDate === "string" &&
    typeof req.query.endDate === "string"
      ? { startDate: req.query.startDate, endDate: req.query.endDate }
      : undefined;

  sendSuccess(res, await listAssignments(range));
}

export async function postAssignment(req: Request, res: Response) {
  sendSuccess(res, await createAssignment(req.body), 201);
}

export async function patchAssignment(req: Request, res: Response) {
  sendSuccess(res, await updateAssignment(Number(req.params.id), req.body));
}

export async function removeAssignment(req: Request, res: Response) {
  sendSuccess(res, await deleteAssignment(Number(req.params.id)));
}

export async function postAssignmentException(req: Request, res: Response) {
  sendSuccess(
    res,
    await createAssignmentException(Number(req.params.id), req.body),
    201,
  );
}

export async function removeAssignmentException(req: Request, res: Response) {
  sendSuccess(
    res,
    await deleteAssignmentException(Number(req.params.id), String(req.params.date)),
  );
}
