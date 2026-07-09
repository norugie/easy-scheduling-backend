import cors from "cors";
import express from "express";
import { corsOptions } from "./config/cors.config.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { requireAuth } from "./middlewares/auth.middleware.js";
import { absencesRouter } from "./routes/absences.routes.js";
import { assignmentsRouter } from "./routes/assignments.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { calendarRouter } from "./routes/calendar.routes.js";
import { calloutsRouter } from "./routes/callouts.routes.js";
import { daysRouter } from "./routes/days.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { communitiesRouter, locationsRouter } from "./routes/references.routes.js";
import { substitutesRouter } from "./routes/substitutes.routes.js";
import { sendError } from "./lib/api-response.js";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/substitutes", requireAuth, substitutesRouter);
app.use("/api/locations", requireAuth, locationsRouter);
app.use("/api/communities", requireAuth, communitiesRouter);
app.use("/api/absences", requireAuth, absencesRouter);
app.use("/api/substitute-assignments", requireAuth, assignmentsRouter);
app.use("/api/callouts", requireAuth, calloutsRouter);
app.use("/api/days", requireAuth, daysRouter);
app.use("/api/calendar", requireAuth, calendarRouter);

app.use((_req, res) => {
  sendError(res, 404, "RESOURCE_NOT_FOUND", "Not found.");
});

app.use(errorMiddleware);

export default app;
