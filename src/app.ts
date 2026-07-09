import cors from "cors";
import express from "express";
import { corsOptions } from "./config/cors.config.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { healthRouter } from "./routes/health.routes.js";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/health", healthRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorMiddleware);

export default app;
