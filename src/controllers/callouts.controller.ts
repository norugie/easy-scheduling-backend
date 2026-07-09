import type { Request, Response } from "express";
import { sendSuccess } from "../lib/api-response.js";
import {
  listCalloutsForDate,
  updateCalloutStatus,
} from "../services/callouts.service.js";

export async function getCallouts(req: Request, res: Response) {
  sendSuccess(res, await listCalloutsForDate(String(req.query.date)));
}

export async function patchCallout(req: Request, res: Response) {
  sendSuccess(
    res,
    await updateCalloutStatus(
      String(req.params.date),
      Number(req.params.substituteId),
      req.body,
    ),
  );
}
