import type { Request, Response } from "express";
import { sendSuccess } from "../lib/api-response.js";
import { getCalendarSummary } from "../services/calendar.service.js";

export async function getCalendar(req: Request, res: Response) {
  sendSuccess(
    res,
    await getCalendarSummary(String(req.query.startDate), String(req.query.endDate)),
  );
}
