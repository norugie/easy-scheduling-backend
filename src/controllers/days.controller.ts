import type { Request, Response } from "express";
import { sendSuccess } from "../lib/api-response.js";
import { getDayDetail, updateDayNotes } from "../services/day.service.js";

export async function getDay(req: Request, res: Response) {
  sendSuccess(res, await getDayDetail(String(req.params.date)));
}

export async function putDayNotes(req: Request, res: Response) {
  sendSuccess(res, await updateDayNotes(String(req.params.date), req.body.notes));
}
